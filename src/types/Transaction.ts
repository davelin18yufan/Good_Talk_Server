import { SUPPORTED_CHARTS } from "@/constants/charts"
import { PrismaClient } from "@prisma/client"

export interface CreateTransactionDto {
  instrumentId: string
  transactionType: string
  quantity: number
  price: number
  commission?: number
  transactionDate: string
  notes?: string
  planId?: string
}

export type UpdateTransactionDto = Partial<CreateTransactionDto>

export interface GetTransactionsDto {
  userId: string
  limit?: number
  offset?: number
}

export type ChartId = (typeof SUPPORTED_CHARTS)[number]

export interface ChartData {
  [key: string]: any // Replace with actual chart data structure
}

export interface ChartHandler {
  (userId: string, prisma: PrismaClient): Promise<any>
}