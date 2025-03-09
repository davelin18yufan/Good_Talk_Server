import { Prisma } from "@prisma/client"

export interface IBase {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface IMessages {
  success: boolean
  message: string
}

export interface IUser extends IBase {
  username: string
  email: string
  passwordHash: string
}

export interface IUserSettings extends IBase {
  initialCapital: Prisma.Decimal
  leverageRatio: Prisma.Decimal
  currentCapital?: Prisma.Decimal
  commissionRate?: Prisma.Decimal
  dashboardLayout?: Prisma.InputJsonValue
  riskTolerance: Prisma.Decimal
  avatarUrl?: string
  profileVideoId?: number
  bio?: string
  location?: string
  aka?: string
}
