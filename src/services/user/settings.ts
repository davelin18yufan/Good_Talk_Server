import { type userSettings } from "@prisma/client"
import { CreateUserSettingsDto, UpdateUserSettingsDto } from "@/types"
import { prisma } from "@/database"

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
    data: {
      ...data,
      dashboardLayout: data.dashboardLayout
        ? JSON.stringify(data.dashboardLayout)
        : undefined,
    },
  })
}

export const updateUserSettings = async (
  userId: string,
  data: UpdateUserSettingsDto
): Promise<userSettings> => {
  return prisma.userSettings.update({
    where: { userId },
    data: {
      ...Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      ),
      updatedAt: new Date(),
    },
  })
}
