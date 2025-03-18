import { Response } from "express"
import {
  AuthenticatedRequest,
  RegisterRequestDto,
  LoginRequestDto,
  ResetPasswordRequestDto,
  RequestResetDto,
} from "../types/Auth"
import * as authService from "@/services/auth"
import { getUserByEmail } from "@/services/user"

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

    if (!result.success) {
      res.status(400).json(result) // return IMessages
      return
    }

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
    res
      .status(500)
      .json({ success: false, message: "Error during login", error })
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

    await authService.requestPasswordReset({ email })

    // Always return 200 even if user doesn't exist (security best practice)
    res.status(200).json({
      success: true,
      message:
        "If your email exists in our system, you will receive a password reset link",
    })

    //? In production, send an email with the reset link here
    //? The reset link would contain the token returned from requestPasswordReset
    //? But don't include the actual token in the API response
  } catch (error) {
    console.error("Password reset request error:", error)
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    })
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

    if(newPassword !== confirmPassword){
      res.status(400).json({
        success: false,
        message: "Two password are not matched."
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
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password",
    })
  }
}
