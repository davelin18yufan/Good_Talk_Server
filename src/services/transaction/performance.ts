import {
  PrismaClient,
  monthlyPerformance,
  yearlyPerformance,
  holdings,
} from "@prisma/client"

const prisma = new PrismaClient()

export const recalculatePerformance = async (userId: string): Promise<void> => {
  const transactions = await prisma.transactions.findMany({
    where: { userId },
    include: { instruments: true },
    orderBy: { transactionDate: "asc" },
  })

  const holdingsMap: {
    [instrumentId: string]: { quantity: number; averageCost: number }
  } = {}
  let totalRealizedProfit = 0
  let totalUnrealizedProfit = 0

  for (const tx of transactions) {
    const instrumentId = tx.instrumentId!
    const quantity = tx.quantity.toNumber()
    const price = tx.price.toNumber()
    const commission = tx.commission?.toNumber() || 0

    if (!holdingsMap[instrumentId]) {
      holdingsMap[instrumentId] = { quantity: 0, averageCost: 0 }
    }

    if (tx.transactionType.includes("BUY")) {
      const current = holdingsMap[instrumentId]
      const newQuantity = current.quantity + quantity
      const newCost =
        (current.quantity * current.averageCost +
          quantity * price +
          commission) /
        newQuantity
      holdingsMap[instrumentId] = {
        quantity: newQuantity,
        averageCost: newCost,
      }
    } else if (tx.transactionType.includes("SELL")) {
      const current = holdingsMap[instrumentId]
      const profit = (price - current.averageCost) * quantity - commission
      totalRealizedProfit += profit
      holdingsMap[instrumentId].quantity -= quantity
    }
  }

  await prisma.holdings.deleteMany({ where: { userId } })
  for (const [instrumentId, holding] of Object.entries(holdingsMap)) {
    if (holding.quantity > 0) {
      const instrument = await prisma.instruments.findUnique({
        where: { id: instrumentId },
      })
      const currentPrice = 100 // Placeholder: Fetch real-time price from an external API
      const currentValue = holding.quantity * currentPrice
      const unrealizedPnl =
        (currentPrice - holding.averageCost) * holding.quantity

      await prisma.holdings.create({
        data: {
          userId,
          instrumentId,
          quantity: holding.quantity,
          averageCost: holding.averageCost,
          currentValue,
          unrealizedPnl,
        },
      })
      totalUnrealizedProfit += unrealizedPnl
    }
  }

  const monthly: { [key: string]: monthlyPerformance } = {}
  const yearly: { [key: string]: yearlyPerformance } = {}

  for (const tx of transactions) {
    const date = new Date(tx.transactionDate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthKey = `${year}-${month}`
    const yearKey = `${year}`

    if (!monthly[monthKey]) {
      monthly[monthKey] = {
        id: "",
        userId,
        year,
        month,
        startingCapital: 0,
        endingCapital: 0,
        deposits: 0,
        withdrawals: 0,
        realizedProfit: 0,
        unrealizedProfit: 0,
        roiPercentage: 0,
        bestPerformingInstrumentId: null,
        worstPerformingInstrumentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    monthly[monthKey].realizedProfit =
      (monthly[monthKey].realizedProfit || 0) + totalRealizedProfit
    monthly[monthKey].unrealizedProfit =
      (monthly[monthKey].unrealizedProfit || 0) + totalUnrealizedProfit
    monthly[monthKey].roiPercentage =
      ((monthly[monthKey].realizedProfit + monthly[monthKey].unrealizedProfit) /
        monthly[monthKey].startingCapital) *
      100

    if (!yearly[yearKey]) {
      yearly[yearKey] = {
        id: "",
        userId,
        year,
        startingCapital: 0,
        endingCapital: 0,
        deposits: 0,
        withdrawals: 0,
        realizedProfit: 0,
        unrealizedProfit: 0,
        roiPercentage: 0,
        bestPerformingInstrumentId: null,
        worstPerformingInstrumentId: null,
        bestPerformingMonth: null,
        worstPerformingMonth: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
    yearly[yearKey].realizedProfit =
      (yearly[yearKey].realizedProfit || 0) + totalRealizedProfit
    yearly[yearKey].unrealizedProfit =
      (yearly[yearKey].unrealizedProfit || 0) + totalUnrealizedProfit
  }

  for (const monthKey in monthly) {
    const [year, month] = monthKey.split("-").map(Number)
    await prisma.monthlyPerformance.upsert({
      where: { userId_year_month: { userId, year, month } },
      update: monthly[monthKey],
      create: monthly[monthKey],
    })
  }

  for (const yearKey in yearly) {
    const year = Number(yearKey)
    await prisma.yearlyPerformance.upsert({
      where: { userId_year: { userId, year } },
      update: yearly[yearKey],
      create: yearly[yearKey],
    })
  }
}
