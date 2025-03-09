import { Response } from "express"
import {
  AuthenticatedRequest,
  RegisterRequestDto,
  LoginRequestDto,
} from "../types/Auth"
import * as authService from "../services/authService"

export const register = async (
  req: AuthenticatedRequest<unknown, RegisterRequestDto>,
  res: Response
) => {
  try {
    const { username, email, password } = req.body
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
