export interface CreateInvestmentPlanDto {
  instrumentId: string
  tradeType: string
  operation: string
  entryPrice: number
  targetPrice: number
  stopPrice?: number
  targetAmount: number
  startDate: string
  endDate: string
  comment?: string
  status: string
}

export type UpdateInvestmentPlanDto = Partial<CreateInvestmentPlanDto>
