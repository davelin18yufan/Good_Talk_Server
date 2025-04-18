import { type userSettings } from "@prisma/client"
import { type CreateUserSettingsDto, type UpdateUserSettingsDto } from "@/types"
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
      //* Explicitly handle dashboardLayout to ensure JSON compatibility
      // JSON.stringify converts the dashboardLayout object to a string, as Prisma's Json field
      // expects a JSON-serializable value. This avoids type mismatches with InputJsonValue.
      // If dashboardLayout is undefined, pass undefined to respect the nullable Json? field.
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
      //* Filter out undefined values to prevent setting non-nullable fields to undefined, which would cause Prisma errors. 
      // Object.entries converts the input data to key-value pairs, filter removes pairs with undefined values, and Object.fromEntries
      // reconstructs the object with only defined values.
      ...Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      ),
      updatedAt: new Date(),
    },
  })
}
