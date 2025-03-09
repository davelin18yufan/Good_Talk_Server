import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import {
  RegisterRequestDto,
  LoginResponseDto,
  RegisterResponseDto,
  LoginRequestDto,
} from "../types/"
import {
  JWT_SECRET,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION,
  SALT,
} from "../constants/config"

const prisma = new PrismaClient()

export const registerUser = async (
  body: RegisterRequestDto
): Promise<RegisterResponseDto> => {
  try {
    //* 1. check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: body.email },
    })
    if (existingUser) {
      return { success: false, message: "Email already exists" }
    }

    //* 2. encrypt password
    const hashedPassword = await bcrypt.hash(body.password, SALT)

    //* 3. create user
    const user = await prisma.users.create({
      data: {
        username: body.username,
        email: body.email,
        passwordHash: hashedPassword,
      },
    })

    //* 4. JWT token generate
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h", // token effective time
    })

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error during registration: " + error.message)
    } else {
      throw new Error("Error during registration")
    }
  }
}

export const loginUser = async ({
  email,
  password,
}: LoginRequestDto): Promise<LoginResponseDto> => {
  try {
    //* 1. check if user exists
    const user = await prisma.users.findUnique({
      where: { email },
    })

    if (!user) {
      // if account not found, simply return.
      return { success: false, message: "User not found" }
    }

    //* 2. if user exists
    // check if user is locked out due to too many failed login attempts
    if (
      user.loginAttempts >= MAX_LOGIN_ATTEMPTS &&
      user.lastFailedLogin &&
      Date.now() - user.lastFailedLogin.getTime() < LOCKOUT_DURATION
    ) {
      return {
        success: false,
        message: `Account locked. Try again after ${Math.ceil(
          (LOCKOUT_DURATION - (Date.now() - user.lastFailedLogin.getTime())) /
            30000
        )} minutes.`,
      }
    }

    //* 3. check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      // if password is incorrect, update login attempts and time
      await prisma.users.update({
        where: { id: user.id },
        data: {
          loginAttempts: user.loginAttempts + 1,
          lastFailedLogin: new Date(),
        },
      })
      return {
        success: false,
        message: `Incorrect password. ${
          MAX_LOGIN_ATTEMPTS - user.loginAttempts - 1
        } attempts remaining.`,
      }
    }

    //* 4. if password is correct, reset login attempts and time
    await prisma.users.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lastFailedLogin: null,
      },
    })

    //* 5. sign and generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h",
    })

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error during login: " + error.message)
    } else {
      throw new Error("Error during login")
    }
  }
}
