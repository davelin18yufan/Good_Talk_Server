import { PrismaClient, userSettings } from "@prisma/client"
import { CreateUserSettingsDto, UpdateUserSettingsDto } from "../types"

const prisma = new PrismaClient()

export const getUserSettings = async (
  userId: string
): Promise<userSettings | null> => {
  return prisma.userSettings.findUnique({
    where: { userId },
  })
}

export const createUserSettings = async (
  data: CreateUserSettingsDto & { userId: string }
): Promise<userSettings> => {
  return prisma.userSettings.create({
    data,
  })
}

export const updateUserSettings = async (
  userId: string,
  data: UpdateUserSettingsDto
): Promise<userSettings> => {
  return prisma.userSettings.update({
    where: { userId },
    data,
  })
}
