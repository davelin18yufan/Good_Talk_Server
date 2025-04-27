import { PrismaClient, investmentPlans } from "@prisma/client"
import {
  type CreateInvestmentPlanDto,
  type UpdateInvestmentPlanDto,
  type GetInvestmentPlansDto,
} from "@/types/Plan"

const prisma = new PrismaClient()


export const getInvestmentPlans = async (
  params: GetInvestmentPlansDto
): Promise<investmentPlans[]> => {
  const { userId, limit, offset } = params
  return prisma.investmentPlans.findMany({
    where: { userId },
    include: {
      instruments: { select: { symbol: true, name: true } },
    },
    orderBy: { startDate: "desc" },
    take: limit,
    skip: offset,
  })
}

export const getInvestmentPlanById = async (
  id: string,
  userId: string
): Promise<investmentPlans | null> => {
  return prisma.investmentPlans.findFirst({
    where: { id, userId },
    include: {
      instruments: { select: { symbol: true, name: true } },
    },
  })
}

export const createInvestmentPlan = async (
  data: CreateInvestmentPlanDto,
  userId: string
): Promise<investmentPlans> => {
  return prisma.investmentPlans.create({
    data: {
      userId,
      instrumentId: data.instrumentId,
      tradeType: data.tradeType,
      operation: data.operation,
      entryPrice: data.entryPrice,
      targetPrice: data.targetPrice,
      stopPrice: data.stopPrice,
      targetAmount: data.targetAmount,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      comment: data.comment,
      status: data.status,
    },
    include: {
      instruments: { select: { symbol: true, name: true } },
    },
  })
}

export const updateInvestmentPlan = async (
  id: string,
  data: UpdateInvestmentPlanDto,
  userId: string
): Promise<investmentPlans> => {
  return prisma.investmentPlans.update({
    where: { id, userId },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      updatedAt: new Date(),
    },
    include: {
      instruments: { select: { symbol: true, name: true } },
    },
  })
}

export const deleteInvestmentPlan = async (
  id: string,
  userId: string
): Promise<void> => {
  await prisma.investmentPlans.delete({ where: { id, userId } })
}

export const bulkCreateInvestmentPlans = async (
  data: any[],
  userId: string
): Promise<investmentPlans[]> => {
  const plans: investmentPlans[] = []

  for (const row of data) {
    const instrument = await prisma.instruments.findFirst({
      where: { symbol: row.instrumentSymbol },
    })
    if (!instrument)
      throw new Error(`Instrument not found: ${row.instrumentSymbol}`)

    const plan = await prisma.investmentPlans.create({
      data: {
        userId,
        instrumentId: instrument.id,
        tradeType: row.tradeType,
        operation: row.operation,
        entryPrice: parseFloat(row.entryPrice),
        targetPrice: parseFloat(row.targetPrice),
        stopPrice: row.stopPrice ? parseFloat(row.stopPrice) : null,
        targetAmount: parseFloat(row.targetAmount),
        startDate: new Date(row.startDate),
        endDate: new Date(row.endDate),
        comment: row.comment,
        status: row.status,
      },
      include: {
        instruments: { select: { symbol: true, name: true } },
      },
    })
    plans.push(plan)
  }

  return plans
}
