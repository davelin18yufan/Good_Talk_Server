import { transactions } from "@prisma/client"
import { prisma } from "@/database"
import { recalculatePerformance } from "./performance"
import {
  type CreateTransactionDto,
  type UpdateTransactionDto,
  type GetTransactionsDto,
} from "@/types/Transaction"

export const getTransactions = async (
  params: GetTransactionsDto
): Promise<transactions[]> => {
  const { userId, limit, offset } = params
  return prisma.transactions.findMany({
    where: { userId },
    include: {
      instruments: { select: { symbol: true, name: true } },
      investmentPlans: {
        select: { id: true, tradeType: true, operation: true },
      },
    },
    orderBy: { transactionDate: "desc" },
    take: limit,
    skip: offset,
  })
}
export const getTransactionById = async (
  id: string,
  userId: string
): Promise<transactions | null> => {
  return prisma.transactions.findFirst({
    where: { id, userId },
    include: { instruments: { select: { symbol: true, name: true } } },
  })
}

export const createTransaction = async (
  data: CreateTransactionDto,
  userId: string
): Promise<transactions> => {
  const transaction = await prisma.transactions.create({
    data: {
      userId,
      instrumentId: data.instrumentId,
      transactionType: data.transactionType,
      quantity: data.quantity,
      price: data.price,
      commission: data.commission,
      transactionDate: new Date(data.transactionDate),
      notes: data.notes,
      planId: data.planId,
    },
    include: { instruments: { select: { symbol: true, name: true } } },
  })

  await recalculatePerformance(userId)
  return transaction
}

export const updateTransaction = async (
  id: string,
  data: UpdateTransactionDto,
  userId: string
): Promise<transactions> => {
  const transaction = await prisma.transactions.update({
    where: { id, userId },
    data: {
      ...data,
      transactionDate: data.transactionDate
        ? new Date(data.transactionDate)
        : undefined,
      updatedAt: new Date(),
    },
    include: { instruments: { select: { symbol: true, name: true } } },
  })

  await recalculatePerformance(userId)
  return transaction
}

export const deleteTransaction = async (
  id: string,
  userId: string
): Promise<void> => {
  await prisma.transactions.delete({ where: { id, userId } })
  await recalculatePerformance(userId)
}

export const bulkCreateTransactions = async (
  data: any[],
  userId: string
): Promise<transactions[]> => {
  const transactions: transactions[] = []

  for (const row of data) {
    const instrument = await prisma.instruments.findFirst({
      where: { symbol: row.instrumentSymbol },
    })
    if (!instrument)
      throw new Error(`Instrument not found: ${row.instrumentSymbol}`)

    const transaction = await prisma.transactions.create({
      data: {
        userId,
        instrumentId: instrument.id,
        transactionType: row.transactionType,
        quantity: parseFloat(row.quantity),
        price: parseFloat(row.price),
        commission: row.commission ? parseFloat(row.commission) : null,
        transactionDate: new Date(row.transactionDate),
        notes: row.notes,
        planId: row.planId || null,
      },
      include: { instruments: { select: { symbol: true, name: true } } },
    })
    transactions.push(transaction)
  }

  await recalculatePerformance(userId)
  return transactions
}
