import type { Response } from "express"
import type {
  AuthenticatedRequest,
  RegisterRequestDto,
  LoginRequestDto,
  ResetPasswordRequestDto,
  RequestResetDto,
} from "../types/Auth"
import * as authService from "@/services/auth"
import { getUserByEmail } from "@/services/user"
import {
  generateRegisterEmailTemplate,
  generateResetEmailTemplate,
  sendErrorResponse,
} from "@/helpers"
import { FRONTEND_URL, RESET_TOKEN_EXPIRY } from "@/constants/config"
import { sendEmail } from "@/services/mail"

export const register = async (
  req: AuthenticatedRequest<unknown, RegisterRequestDto>,
  res: Response
) => {
  try {
    const { username, email, password } = req.body

    // Searching for the user in the database
    const existedUser = await getUserByEmail(email)
    if (existedUser) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      })
      return
    }

    const result = await authService.registerUser({
      username,
      email,
      password,
    })

    if (!result.success || !("user" in result)) {
      res.status(400).json(result) // return IMessages
      return
    }

    // Send email verification
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${result.token}`
    await sendEmail({
      to: [result.user.email],
      subject: "【Good Talk】帳號驗證啟用信",
      content: generateRegisterEmailTemplate(verifyUrl, result.user.username),
    })

    res.status(201).json(result) // return success data
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during registration",
      error: (error as Error).message,
    })
  }
}

export const login = async (
  req: AuthenticatedRequest<unknown, LoginRequestDto>,
  res: Response
) => {
  try {
    const { email, password } = req.body
    const result = await authService.loginUser({ email, password })

    if (!result.success) {
      res.status(401).json(result) // return IMessages
      return
    }

    res.status(200).json(result) // return success data
  } catch (error) {
    sendErrorResponse(res, 500, "Error during login", error)
  }
}

/**
 * Request a password reset - generates token and sends email
 */
export const requestReset = async (
  req: AuthenticatedRequest<unknown, RequestResetDto>,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      })
      return
    }

    // Reset token and expiry
    const {
      token: resetToken,
      user,
      message,
      success,
    } = await authService.resetTokenAndExpiry({
      email,
      tokenType: "resetToken",
      expiryDuration: RESET_TOKEN_EXPIRY,
      checkEmailVerified: false,
      returnRawToken: true,
    })

    if (!success || !user) {
      throw new Error(message)
    }

    // send reset email
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`
    await sendEmail({
      to: [user.email],
      subject: "Password Reset Request",
      content: generateResetEmailTemplate(resetLink, user.username),
    })

    // Always return 200 even if user doesn't exist (security best practice)
    res.status(200).json({
      success: true,
      message:
        "If your email exists in our system, you will receive a password reset link",
    })
  } catch (error) {
    console.error("Password reset request error:", error)
    sendErrorResponse(res, 500, "Error during registration", error)
  }
}

/**
 * Reset password using valid token
 */
export const resetPassword = async (
  req: AuthenticatedRequest<unknown, ResetPasswordRequestDto>,
  res: Response
): Promise<void> => {
  try {
    const { token, newPassword, confirmPassword } = req.body

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Two password are not matched.",
      })
    }

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Token and new password are required.",
      })
      return
    }

    const result = await authService.resetPassword({ token, newPassword })

    if (result.success) {
      res.status(200).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error("Password reset error:", error)
    sendErrorResponse(
      res,
      500,
      "An error occurred while resetting your password",
      error
    )
  }
}

export const verifyEmail = async (
  req: AuthenticatedRequest<unknown, { email: string; token: string }>,
  res: Response
) => {
  try {
    const { email, token } = req.body

    if (!email || !token) {
      res.status(400).json({
        success: false,
        message: "Email and token are required.",
      })
      return
    }

    const result = await authService.verifyUserEmail({ email, token })

    if (result.success) {
      res.status(200).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error("Email verification error:", error)
    sendErrorResponse(res, 500, "Error during email verification", error)
  }
}

export const resendVerificationEmail = async (
  req: AuthenticatedRequest<unknown, { email: string }>,
  res: Response
) => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      })
      return
    }

    // reset token and expiry
    const {
      token: verificationToken,
      user,
      success,
      message,
    } = await authService.resetTokenAndExpiry({
      email,
      tokenType: "emailVerificationToken",
      expiryDuration: RESET_TOKEN_EXPIRY,
      checkEmailVerified: true,
      returnRawToken: true,
    })

    if (!success || !user) {
      throw new Error(message)
    }

    // send verification email
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`
    await sendEmail({
      to: [user.email],
      subject: "Resend Email Verification",
      content: generateRegisterEmailTemplate(verifyUrl, user?.username),
    })

    // Always return 200 even if user doesn't exist (security best practice)
    res.status(200).json({
      success: true,
      message:
        "If your email exists in our system, you will receive a verification link",
    })
  } catch (error) {
    console.error("Resend verification email error:", error)
    sendErrorResponse(res, 500, "Error during registration", error)
  }
}
