import type { Response } from "express"
import { Request } from "express"
import * as userService from "../services/user/core"
import type { CreateUserDto, UpdateUserDto } from "../types"
import type { AuthenticatedRequest } from "../types"
import bcrypt from "bcryptjs"
import { SALT } from "../constants/config"
import { sendErrorResponse } from "@/helpers"

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await userService.getAllUsers()

    res.json(users)
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching users", error)
  }
}

export const getUserById = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params
    const user = await userService.getUserById(id)

    if (!user) {
      res.status(404).json({ message: "User not found" })
      return
    }

    res.json(user)
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching user", error)
  }
}

export const createUser = async (
  req: AuthenticatedRequest<unknown, CreateUserDto>,
  res: Response
) => {
  try {
    const data = req.body
    const newUser = await userService.createUser(data)

    res.status(201).json(newUser)
  } catch (error) {
    sendErrorResponse(res, 500, "Error creating user", error)
  }
}

export const updateUser = async (
  req: AuthenticatedRequest<{ id: string }, {}, UpdateUserDto>,
  res: Response
) => {
  try {
    const { id } = req.params
    const data = req.body

    const updatedUser = await userService.updateUser(id, data)

    res.json(updatedUser)
  } catch (error) {
    sendErrorResponse(res, 500, "Error updating user", error)
  }
}

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    await userService.deleteUser(id)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    sendErrorResponse(res, 500, "Error deleting user", error)
  }
}

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { password, email, username } = req.body

    const salt = await bcrypt.genSalt(+SALT)
    const hashedPassword = await bcrypt.hash(password, salt)

    // TODO: Add email verification

    await userService.changePassword(email, hashedPassword)

    res.status(204).json({ message: "Password changed successfully" })
  } catch (error) {
    sendErrorResponse(res, 500, "Error changing password", error)
  }
}
