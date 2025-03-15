import { Prisma } from "@prisma/client"

// user create DTO
export interface CreateUserSettingsDto {
  initialCapital: Prisma.Decimal
  leverageRatio: Prisma.Decimal
  currentCapital?: Prisma.Decimal
  commissionRate?: Prisma.Decimal
  dashboardLayout?: Prisma.InputJsonValue
  riskTolerance: Prisma.Decimal
  avatarUrl?: string
  profileVideoId?: string
  bio?: string
  location?: string
  aka?: string
}

// user update DTO
export interface UpdateUserSettingsDto {
  initialCapital?: Prisma.Decimal
  leverageRatio?: Prisma.Decimal
  currentCapital?: Prisma.Decimal
  commissionRate?: Prisma.Decimal
  dashboardLayout?: Prisma.InputJsonValue
  riskTolerance?: Prisma.Decimal
  avatarUrl?: string
  profileVideoId?: string
  bio?: string
  location?: string
  aka?: string
}
