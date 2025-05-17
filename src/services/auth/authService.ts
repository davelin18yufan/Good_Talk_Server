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
  RequestResetResponseDto,
  RequestResetDto,
} from "@/types"
import {
  JWT_SECRET,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION,
  SALT,
  RESET_TOKEN_EXPIRY,
  FRONTEND_URL,
} from "@/constants/config"
import { sendEmail } from "../mail/emailService"
import crypto from "node:crypto"
import { generateResetEmailTemplate } from "@/helpers"

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

    //* 5. prepare verification link and send email
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`
    await sendEmail({
      to: [user.email],
      subject: "【Good Talk】帳號驗證啟用信",
      content: generateResetEmailTemplate(verifyUrl, user.username),
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

export const verifyUserEmail = async ({
  email,
  token,
}: {
  email: string
  token: string
}): Promise<{ success: boolean; message: string }> => {
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

export const resendVerificationEmail = async ({
  email,
}: {
  email: string
}): Promise<{ success: boolean; message: string }> => {
  try {
    // Find user with the provided email
    const user = await prisma.users.findUnique({
      where: { email },
    })

    if (!user) {
      return {
        success: false,
        message: "User not found",
      }
    }

    // Check if the email is already verified
    if (user.isEmailVerified) {
      return {
        success: false,
        message: "Email is already verified",
      }
    }

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex")

    // Set expiry time for the token
    const expiryDate = new Date(Date.now() + 1000 * 60 * 60 * 2) // 2 hours

    // Update user with the new token and expiry date
    await prisma.users.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: expiryDate,
      },
    })

    // Prepare verification link and send email
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`
    await sendEmail({
      to: [user.email],
      subject: "Resend Email Verification",
      content: generateResetEmailTemplate(verifyUrl, user.username),
    })

    return {
      success: true,
      message:
        "A new verification email has been sent. Please check your inbox.",
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error resending verification email: " + error.message)
    } else {
      throw new Error("Error resending verification email")
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
 * Request password reset - creates and stores a reset token
 */
export const requestPasswordReset = async ({
  email,
}: RequestResetDto): Promise<RequestResetResponseDto> => {
  try {
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { email },
    })

    if (!user) {
      //! For security, still return success even if user doesn't exist
      //! This prevents user enumeration attacks
      return {
        success: true,
        message:
          "If your email exists in our system, you will receive a password reset link.",
      }
    }

    // Generate a secure random token (synchronous version)
    const resetToken = crypto.randomBytes(32).toString("hex")

    // Hash the token for storage using SHA-256
    // This follows the pattern in the original code but uses the API correctly
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    // Set expiry time
    const tokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY)

    // Store the token in the database
    await prisma.users.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: tokenExpiry,
      },
    })

    // send reset email
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`
    await sendEmail({
      to: [user.email],
      subject: "Password Reset Request",
      content: generateResetEmailTemplate(resetLink, user.username),
    })

    return {
      success: true,
      message:
        "If your email exists in our system, you will receive a password reset link.",
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error requesting password reset: " + error.message)
    } else {
      throw new Error("Error requesting password reset")
    }
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
