import { Request, Response } from "express"
import {
  AuthenticatedRequest,
  CreateUserSettingsDto,
  UpdateUserSettingsDto,
} from "../types"
import * as userSettingService from "@/services/user/settings"
import { sendErrorResponse } from "@/helpers"

export const getUserSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id

  try {
    const userSettings = await userSettingService.getUserSettings(userId!)

    if (!userSettings) {
      res.status(404).json({ message: "User settings not found" })
      return
    }

    res.status(200).json(userSettings)
  } catch (error) {
    sendErrorResponse(res, 500, "Error get user settings", error)
  }
}

export const createUserSettings = async (
  req: Request<object, object, CreateUserSettingsDto> & AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id
  const {
    initialCapital,
    leverageRatio,
    currentCapital,
    commissionRate,
    dashboardLayout,
    riskTolerance,
    avatarUrl,
    profileVideoId,
    bio,
    location,
    aka,
  } = req.body

  try {
    const userSettings = await userSettingService.createUserSettings({
      userId: userId!,
      initialCapital,
      leverageRatio,
      currentCapital,
      commissionRate,
      dashboardLayout,
      riskTolerance,
      avatarUrl,
      profileVideoId,
      bio,
      location,
      aka,
    })

    res.status(201).json(userSettings)
  } catch (error) {
    sendErrorResponse(res, 500, "Error creating user setting", error)
  }
}

export const updateUserSettings = async (
  req: Request<object, object, UpdateUserSettingsDto> & AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id
  const settings = req.body

  try {
    const userSettings = await userSettingService.updateUserSettings(
      userId!,
      settings
    )

    res.status(201).json(userSettings)
  } catch (error) {
    sendErrorResponse(res, 500, "Error updating user setting", error)
  }
}
