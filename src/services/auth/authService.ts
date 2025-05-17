import { prisma } from "@/database"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type {
  RegisterRequestDto,
  LoginResponseDto,
  RegisterResponseDto,
  LoginRequestDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  ResetTokenAndExpiryOptions,
  IMessages,
} from "@/types"
import {
  JWT_SECRET,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION,
  SALT,
} from "@/constants/config"
import crypto from "node:crypto"

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
    const hashedPassword = await bcrypt.hash(body.password, +SALT)

    //* 3. generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex")

    const expiryDate = new Date(Date.now() + 1000 * 60 * 60 * 2) // 2 hours

    //* 4. create user
    const user = await prisma.users.create({
      data: {
        username: body.username,
        email: body.email,
        passwordHash: hashedPassword,
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: expiryDate,
      },
    })

    //* 4. JWT token generate
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h", // token effective time
    })

    return {
      success: true,
      message: "User registered successfully",
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

export const verifyUserEmail = async ({
  email,
  token,
}: {
  email: string
  token: string
}): Promise<IMessages> => {
  try {
    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    // Find user with email and check verification token that hasn't expired
    const user = await prisma.users.findFirst({
      where: {
        email,
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: {
          gt: new Date(), // greater than
        },
      },
    })

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired email verification token",
      }
    }

    // Update user to mark email as verified and clear the token fields
    await prisma.users.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      },
    })

    return {
      success: true,
      message: "Email verified successfully",
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error verifying email: " + error.message)
    } else {
      throw new Error("Error verifying email")
    }
  }
}

export const loginUser = async ({
  email,
  password,
}: LoginRequestDto): Promise<LoginResponseDto> => {
  try {
    //* 1. check if user exists and email is valid
    const user = await prisma.users.findUnique({
      where: { email },
    })

    if (!user) {
      // if account not found, simply return.
      return { success: false, message: "User not found" }
    }

    // check if user is verified
    if (!user.isEmailVerified) {
      return {
        success: false,
        message: "Please verify your email before logging in.",
      }
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

/**
 * 支援產生並儲存使用者的 Token（例如：重設密碼或信箱驗證）。
 *
 * @param {ResetTokenAndExpiryOptions} params
 * @param {string} params.email - User Email
 * @param {"resetToken" | "emailVerificationToken"} params.tokenType - reset token 欄位名稱
 * @param {number} params.expiryDuration - token 有效時間（millisecond）
 * @param {boolean} [params.checkEmailVerified=false] - 是否檢查使用者信箱是否已驗證（通常用在驗證信流程）
 * @param {boolean} [params.returnRawToken=false] - 是否回傳原始 token（非 hash），建議用於寄信
 *
 * @returns  回傳結果物件，包含成功訊息與必要資訊（視需求附上 raw token 和使用者資訊）
 */
export const resetTokenAndExpiry = async ({
  email,
  tokenType,
  expiryDuration,
  checkEmailVerified = false,
  returnRawToken = false,
}: ResetTokenAndExpiryOptions): Promise<
  IMessages & {
    token?: string
    user?: {
      id: string
      username: string
      email: string
    }
  }
> => {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    })

    if (!user) {
      const defaultMsg =
        tokenType === "resetToken"
          ? "If your email exists in our system, you will receive a password reset link."
          : "User not found"
      //! For security, still return success in reset password even if user doesn't exist
      //! This prevents user enumeration attacks
      return { success: tokenType === "resetToken", message: defaultMsg }
    }

    if (checkEmailVerified && user.isEmailVerified) {
      return {
        success: false,
        message: "Email is already verified",
      }
    }

    // Generate a new token and hash it
    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex")
    const expiry = new Date(Date.now() + expiryDuration)

    await prisma.users.update({
      where: { id: user.id },
      data: {
        [tokenType]: hashedToken,
        [`${tokenType}Expiry`]: expiry,
      },
    })

    const successMsg =
      tokenType === "resetToken"
        ? "If your email exists in our system, you will receive a password reset link."
        : "A new verification email has been sent. Please check your inbox."

    return {
      success: true,
      message: successMsg,
      ...(returnRawToken && {
        token: rawToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      }),
    }
  } catch (error) {
    throw new Error(
      `Error resetting ${tokenType}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

/**
 * Reset password using a valid token
 */
export const resetPassword = async ({
  token,
  newPassword,
}: Omit<
  ResetPasswordRequestDto,
  "confirmPassword"
>): Promise<ResetPasswordResponseDto> => {
  try {
    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    //* Find user with this reset token that hasn't expired
    const user = await prisma.users.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(), // greater than
        },
      },
    })

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired password reset token",
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, +SALT)

    // Update user password and clear reset token fields
    await prisma.users.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        loginAttempts: 0, // Also reset login attempts on password reset
        lastFailedLogin: null,
      },
    })

    return {
      success: true,
      message: "Password has been reset successfully",
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error resetting password: " + error.message)
    } else {
      throw new Error("Error resetting password")
    }
  }
}
