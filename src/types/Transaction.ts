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

