import { prisma } from "@/database"
import { fetchMarketPrice, getPositionCurrentPrices } from "@/helpers/fugle"
import { CurrentPrices } from "@/types/Fugle"
import { GenericChartData } from "@/types/Transaction"

export async function calculateProfitChart(
  userId: string,
): Promise<GenericChartData> {
  const transactions = await prisma.transactions.findMany({
    where: { userId },
    include: { instruments: true },
    orderBy: { transactionDate: "asc" },
  })

  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
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

  for (const [instrumentId, holding] of Object.entries(holdingsMap)) {
    if (holding.quantity > 0) {
      const instrument = await prisma.instruments.findUnique({
        where: { id: instrumentId },
      })
      if (!instrument) continue

      const currentPrice = await fetchMarketPrice(instrument.symbol)
      const unrealizedPnl =
        (currentPrice - holding.averageCost) * holding.quantity
      totalUnrealizedProfit += unrealizedPnl
    }
  }

  const monthly: { [key: string]: any } = {}
  for (const tx of transactions) {
    const date = new Date(tx.transactionDate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthKey = `${year}-${month}`

    if (!monthly[monthKey]) {
      monthly[monthKey] = {
        realizedProfit: 0,
        unrealizedProfit: 0,
        startingCapital: userSettings?.initialCapital.toNumber() || 0,
      }
    }

    const price = tx.price.toNumber()
    const quantity = tx.quantity.toNumber()
    const commission = tx.commission?.toNumber() || 0
    let profit = 0
    if (tx.transactionType.includes("SELL")) {
      const holding = holdingsMap[tx.instrumentId!]
      profit = (price - holding.averageCost) * quantity - commission
    }

    monthly[monthKey].realizedProfit += profit
    monthly[monthKey].unrealizedProfit = totalUnrealizedProfit
  }

  const result = []
  for (const monthKey in monthly) {
    const [year, month] = monthKey.split("-").map(Number)
    const benchmark = await prisma.benchmarks.findUnique({
      where: { name_year_month: { name: "TWSE", year, month } },
    })
    const monthName = new Date(year, month - 1).toLocaleString("en-US", {
      month: "short",
    })
    const userReturn =
      monthly[monthKey].startingCapital > 0
        ? ((monthly[monthKey].realizedProfit +
            monthly[monthKey].unrealizedProfit) /
            monthly[monthKey].startingCapital) *
          100
        : 0
    const twseReturn = benchmark?.return.toNumber() || 0
    const relativePerformance =
      twseReturn > 0 ? ((userReturn / twseReturn) * 100).toFixed(1) : "0.0"

    result.push({
      month: monthName,
      TWSE: twseReturn,
      Me: userReturn,
      相對表現: relativePerformance,
    })
  }

  return result
}

export async function calculateRealizedPnlChart(
  userId: string,
): Promise<GenericChartData> {
  const transactions = await prisma.transactions.findMany({
    where: { userId },
    include: { instruments: true },
    orderBy: { transactionDate: "asc" },
  })

  const holdingsMap: {
    [instrumentId: string]: { quantity: number; averageCost: number }
  } = {}

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
      holdingsMap[instrumentId].quantity -= quantity
    }
  }

  const weekly: {
    [key: string]: { trades: number; profit: number; profitable: number }
  } = {}
  for (const tx of transactions) {
    const date = new Date(tx.transactionDate)
    const week = `${date.toLocaleString("en-US", {
      month: "long",
    })}/${Math.ceil(date.getDate() / 7)}`

    if (!weekly[week]) {
      weekly[week] = { trades: 0, profit: 0, profitable: 0 }
    }
    weekly[week].trades += 1
    const price = tx.price.toNumber()
    const quantity = tx.quantity.toNumber()
    const commission = tx.commission?.toNumber() || 0
    let profit = 0
    if (tx.transactionType.includes("SELL")) {
      const holding = holdingsMap[tx.instrumentId!]
      profit = (price - holding.averageCost) * quantity - commission
    }
    weekly[week].profit += profit
    if (profit > 0) weekly[week].profitable += 1
  }

  return Object.entries(weekly).map(([week, data]) => ({
    week,
    成交筆數: data.trades,
    報酬率: data.trades > 0 ? (data.profit / data.trades).toFixed(2) : "0",
    獲利筆數: data.profitable,
  }))
}

export async function calculateTradeFundBase(
  userId: string,
): Promise<GenericChartData> {
  const transactions = await prisma.transactions.findMany({
    where: { userId },
    include: { instruments: true },
    orderBy: { transactionDate: "asc" },
  })

  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  let cashBalance = 0
  let totalMarketValue = 0
  const holdingsMap: {
    [instrumentId: string]: {
      quantity: number
      averageCost: number
      symbol: string
    }
  } = {}

  for (const tx of transactions) {
    const instrumentId = tx.instrumentId!
    const quantity = tx.quantity.toNumber()
    const price = tx.price.toNumber()
    const commission = tx.commission?.toNumber() || 0

    if (!holdingsMap[instrumentId]) {
      holdingsMap[instrumentId] = {
        quantity: 0,
        averageCost: 0,
        symbol: tx.instruments?.symbol || "",
      }
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
        ...current,
        quantity: newQuantity,
        averageCost: newCost,
      }
      cashBalance -= quantity * price + commission
    } else if (tx.transactionType.includes("SELL")) {
      holdingsMap[instrumentId].quantity -= quantity
      cashBalance += quantity * price - commission
    }
  }

  const symbols = Object.values(holdingsMap)
    .filter((holding) => holding.quantity > 0)
    .map((holding) => holding.symbol)
  const currentPrices: CurrentPrices = await getPositionCurrentPrices(symbols)

  for (const [instrumentId, holding] of Object.entries(holdingsMap)) {
    if (holding.quantity > 0) {
      const currentPriceObj = currentPrices.find(
        (p) => p.symbol === holding.symbol
      )
      const currentPrice = currentPriceObj
        ? currentPriceObj.closePrice
        : await fetchMarketPrice(holding.symbol)
      const currentValue = holding.quantity * currentPrice
      totalMarketValue += currentValue
    }
  }

  return [
    {
      name: "現金水位",
      value: cashBalance + (userSettings?.currentCapital?.toNumber() || 0),
    },
    { name: "持倉部位", value: totalMarketValue },
  ]
}

export async function calculateTradeSummary(
  userId: string,
): Promise<GenericChartData> {
  const transactions = await prisma.transactions.findMany({
    where: { userId },
    include: { instruments: true },
    orderBy: { transactionDate: "asc" },
  })

  const holdingsMap: {
    [instrumentId: string]: {
      quantity: number
      averageCost: number
      symbol: string
    }
  } = {}
  const position: Array<{
    asset_id: string
    asset_name: string
    quantity: number
    cost: number
  }> = []
  let totalMarketValue = 0

  for (const tx of transactions) {
    const instrumentId = tx.instrumentId!
    const quantity = tx.quantity.toNumber()
    const price = tx.price.toNumber()
    const commission = tx.commission?.toNumber() || 0

    if (!holdingsMap[instrumentId]) {
      holdingsMap[instrumentId] = {
        quantity: 0,
        averageCost: 0,
        symbol: tx.instruments?.symbol || "",
      }
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
        ...current,
        quantity: newQuantity,
        averageCost: newCost,
      }
    } else if (tx.transactionType.includes("SELL")) {
      holdingsMap[instrumentId].quantity -= quantity
    }
  }

  const symbols = Object.values(holdingsMap)
    .filter((holding) => holding.quantity > 0)
    .map((holding) => holding.symbol)
  const currentPrices: CurrentPrices = await getPositionCurrentPrices(symbols)

  for (const [instrumentId, holding] of Object.entries(holdingsMap)) {
    if (holding.quantity > 0) {
      const instrument = await prisma.instruments.findUnique({
        where: { id: instrumentId },
      })
      if (!instrument) continue

      const currentPriceObj = currentPrices.find(
        (p) => p.symbol === instrument.symbol
      )
      const currentPrice = currentPriceObj
        ? currentPriceObj.closePrice
        : await fetchMarketPrice(instrument.symbol)
      const currentValue = holding.quantity * currentPrice
      totalMarketValue += currentValue

      position.push({
        asset_id: instrument.symbol,
        asset_name: instrument.name,
        quantity: holding.quantity,
        cost: holding.averageCost,
      })
    }
  }

  const totalCost = Object.values(holdingsMap).reduce(
    (sum, h) => sum + h.quantity * h.averageCost,
    0
  )

  return {
    asset: {
      id: userId,
      totalCost,
      totalMarketPrice: totalMarketValue,
      position,
    },
    currentPrices,
  }
}

export async function calculateTradeLog(
  userId: string,
): Promise<GenericChartData> {
  const transactions = await prisma.transactions.findMany({
    where: { userId },
    include: {
      instruments: { select: { symbol: true, name: true } },
      investmentPlans: { select: { tradeType: true, operation: true } },
    },
    orderBy: { transactionDate: "desc" },
    take: 10,
  })

  return transactions.map((tx) => ({
    id: tx.id,
    type: tx.investmentPlans?.tradeType || "多單",
    action: tx.transactionType,
    target: {
      symbol: tx.instruments?.symbol || "",
      name: tx.instruments?.name || "",
    },
    date: tx.transactionDate.toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    price: tx.price.toNumber(),
    quantity: tx.quantity.toNumber(),
    comment: tx.notes,
  }))
}

export async function calculateTradePlan(
  userId: string,
): Promise<GenericChartData> {
  const plans = await prisma.investmentPlans.findMany({
    where: { userId },
    include: { instruments: { select: { symbol: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  })
  

  return plans.map((plan) => {
    const targetProfit = plan.targetPrice
      ? plan.targetPrice.toNumber() - (plan.entryPrice?.toNumber() || 0)
      : null;
    const expectation = plan.targetPrice
      ? ((targetProfit || 0) / (plan.entryPrice?.toNumber() || 1)) * 100
      : null

    return {
      id: plan.id,
      type: plan.tradeType,
      target: {
        symbol: plan.instruments?.symbol,
        name: plan.instruments?.name,
      },
      action: plan.operation,
      entryPrice: plan.entryPrice?.toNumber(),
      targetPrice: plan.targetPrice?.toNumber(),
      stop: {
        type: plan.stopType,
        price: plan.stopPrice?.toNumber(),
      },
      expectation,
      isExecuted: plan.status === "EXECUTED",
      comment: plan.comment,
      targetProfit,
    };
  });
}

export async function calculateGoalProgress(
  userId: string
): Promise<GenericChartData> {
  const goals = await prisma.userGoals.findMany({ where: { userId } })
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  const currentCapital = userSettings?.currentCapital?.toNumber() || 0
  const primaryGoal = goals[0]

  if (!primaryGoal) {
    return [
      { name: "Goal", value: 100, color: "var(--chart-3)", actualValue: 0 },
      { name: "已達成進度", value: 0, color: "var(--chart-2)", actualValue: 0 },
      { name: "剩餘進度", value: 100, color: "var(--chart-1)", actualValue: 0 },
    ]
  }

  const target = primaryGoal.targetAmount.toNumber()
  const achieved = Math.min(currentCapital, target)
  const achievedPercentage = (achieved / target) * 100
  const remainingPercentage = 100 - achievedPercentage

  return [
    {
      name: primaryGoal.title,
      value: 100,
      color: "var(--chart-3)",
      actualValue: target,
    },
    {
      name: "已達成進度",
      value: achievedPercentage,
      color: "var(--chart-2)",
      actualValue: achieved,
    },
    {
      name: "剩餘進度",
      value: remainingPercentage,
      color: "var(--chart-1)",
      actualValue: target - achieved,
    },
  ]
}

export async function calculatePortfolioAllocationChart(userId: string) {
  const holdings = await prisma.holdings.findMany({
    where: { userId },
    include: { instruments: { select: { name: true } } },
  })
  return holdings.map((holding) => ({
    name: holding.instruments?.name || "Unknown",
    value: holding.currentValue?.toNumber(),
  }))
}
