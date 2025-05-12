import type { PlanType, StopType } from "./Transaction"

export type PlanStatus = "EXECUTED" | "PENDING" | "EXPIRED"

export interface CreateInvestmentPlanDto {
  symbol: string
  tradeType: PlanType // "多單" or "空單"
  operation: string
  entryPrice: number
  targetPrice: number
  stopPrice?: number
  targetAmount: number
  startDate: string
  endDate: string
  comment?: string
  status: PlanStatus
  stopType: StopType // "停損" or "停利"
}

export type UpdateInvestmentPlanDto = Partial<CreateInvestmentPlanDto>

export interface GetInvestmentPlansDto {
  userId: string
  limit?: number
  offset?: number
}
