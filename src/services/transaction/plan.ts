import { CreateInvestmentPlanDto,UpdateInvestmentPlanDto } from "@/types/Plan";
import { ActionType, PlanType, StopType, TradePlanItem } from "@/types/Transaction";
import { prisma } from "@/database";

export const getUserPlans = async (userId: string): Promise<TradePlanItem[]> => {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const plans = await prisma.investmentPlans.findMany({
    where: { userId },
    include: { instruments: { select: { symbol: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (plans.length === 0) {
    return [];
  }

  return plans.map((plan) => {
    const expectation = plan.targetPrice && plan.entryPrice
      ? ((plan.targetPrice.toNumber() - plan.entryPrice.toNumber()) / plan.entryPrice.toNumber()) * 100
      : 0;

    return ({
      id: plan.id,
      type: (plan.tradeType) as PlanType,
      target: {
        symbol: plan.instruments?.symbol ?? "",
        name: plan.instruments?.name ?? "",
      },
      action: (plan.operation) as ActionType,
      entryPrice: plan.entryPrice?.toNumber() ?? 0,
      targetPrice: plan.targetPrice?.toNumber() ?? 0,
      stop: {
        type: (plan.stopType) as StopType,
        price: plan.stopPrice?.toNumber() ?? 0,
      },
      expectation,
      isExecuted: plan.status === "EXECUTED",
      comment: plan.comment ?? "",
  })});
};

export const createPlan = async (userId: string, data: CreateInvestmentPlanDto): Promise<TradePlanItem> => {
  const { tradeType, symbol, operation, entryPrice, targetPrice, stopType, stopPrice, comment } = data;

  if (!["多單", "空單"].includes(tradeType)) {
    throw new Error("Invalid tradeType");
  }
  if (!["BUY", "SELL"].includes(operation)) {
    throw new Error("Invalid operation");
  }
  if (!["停損", "停利"].includes(stopType)) {
    throw new Error("Invalid stopType");
  }

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const instrument = await prisma.instruments.findFirst({ where: { symbol } });
  if (!instrument) {
    throw new Error("Instrument not found");
  }

  const plan = await prisma.investmentPlans.create({
    data: {
      userId,
      instrumentId: instrument.id,
      tradeType,
      operation,
      entryPrice,
      targetPrice,
      stopType,
      stopPrice,
      // Removed expectation as it is not part of the investmentPlansCreateInput type
      comment,
      status: "PENDING",
    },
    include: { instruments: { select: { symbol: true, name: true } } },
  });

  return {
    id: plan.id,
    type: plan.tradeType as PlanType,
    target: {
      symbol: plan.instruments?.symbol,
      name: plan.instruments?.name,
    },
    action: plan.operation as ActionType,
    entryPrice: plan.entryPrice?.toNumber() ?? 0,
    targetPrice: plan.targetPrice?.toNumber() ?? 0,
    stop: {
      type: plan.stopType as StopType,
      price: plan.stopPrice?.toNumber() ?? 0,
    },
    expectation: plan.targetPrice && plan.entryPrice
      ? ((plan.targetPrice.toNumber() - plan.entryPrice.toNumber()) / plan.entryPrice.toNumber()) * 100 : 0,
    isExecuted: plan.status === "EXECUTED",
    comment: plan.comment ?? "",
  };
};

export const updatePlan = async (userId: string, planId: string, data: UpdateInvestmentPlanDto): Promise<TradePlanItem> => {
  const { tradeType, symbol, operation, entryPrice, targetPrice, stopType, stopPrice, comment } = data;

  if (tradeType && !["多單", "空單"].includes(tradeType)) {
    throw new Error("Invalid tradeType");
  }
  if (operation && !["BUY", "SELL"].includes(operation)) {
    throw new Error("Invalid operation");
  }
  if (stopType && !["停損", "停利"].includes(stopType)) {
    throw new Error("Invalid stopType");
  }

  
  const plan = await prisma.investmentPlans.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== userId) {
    throw new Error("Plan not found");
  }
  
  // find corresponding instrument
  const instrument = await prisma.instruments.findFirst({ where: { symbol } });
  if (!instrument) {
    throw new Error("Instrument not found");
  }

  const updatedPlan = await prisma.investmentPlans.update({
    where: { id: planId },
    data: {
      tradeType,
      instrumentId: instrument.id,
      operation,
      entryPrice,
      targetPrice,
      stopType,
      stopPrice,
      comment,
    },
    include: { instruments: { select: { symbol: true, name: true } } },
  });

  return {
    id: updatedPlan.id,
    type: updatedPlan.tradeType as PlanType,
    target: {
      symbol: updatedPlan.instruments?.symbol,
      name: updatedPlan.instruments?.name,
    },
    action: updatedPlan.operation as ActionType,
    entryPrice: updatedPlan.entryPrice?.toNumber() ?? 0,
    targetPrice: updatedPlan.targetPrice?.toNumber() ?? 0,
    stop: {
      type: updatedPlan.stopType as StopType,
      price: updatedPlan.stopPrice?.toNumber() ?? 0,
    },
    expectation: updatedPlan.targetPrice && updatedPlan.entryPrice
      ? ((updatedPlan.targetPrice.toNumber() - updatedPlan.entryPrice.toNumber()) / updatedPlan.entryPrice.toNumber()) * 100 : 0,
    isExecuted: updatedPlan.status === "EXECUTED",
    comment: updatedPlan.comment ?? "",
  };
};

export const deletePlan = async (userId: string, planId: string): Promise<void> => {
  const plan = await prisma.investmentPlans.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== userId) {
    throw new Error("Plan not found");
  }

  await prisma.investmentPlans.delete({ where: { id: planId } });
};

export const togglePlanExecuted = async (userId: string, planId: string): Promise<TradePlanItem> => {
  const plan = await prisma.investmentPlans.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== userId) {
    throw new Error("Plan not found");
  }

  const newStatus = plan.status === "EXECUTED" ? "PENDING" : "EXECUTED";

  const updatedPlan = await prisma.investmentPlans.update({
    where: { id: planId },
    data: { status: newStatus },
    include: { instruments: { select: { symbol: true, name: true } } },
  });

  return {
    id: updatedPlan.id,
    type: updatedPlan.tradeType as PlanType,
    target: {
      symbol: updatedPlan.instruments?.symbol ?? "",
      name: updatedPlan.instruments?.name ?? "",
    },
    action: updatedPlan.operation as ActionType,
    entryPrice: updatedPlan.entryPrice?.toNumber() ?? 0,
    targetPrice: updatedPlan.targetPrice?.toNumber() ?? 0,
    stop: {
      type: updatedPlan.stopType as StopType,
      price: updatedPlan.stopPrice?.toNumber() ?? 0,
    },
    expectation: updatedPlan.targetPrice && updatedPlan.entryPrice
      ? ((updatedPlan.targetPrice.toNumber() - updatedPlan.entryPrice.toNumber()) / updatedPlan.entryPrice.toNumber()) * 100 : 0,
    isExecuted: updatedPlan.status === "EXECUTED",
    comment: updatedPlan.comment ?? "",
  };
};