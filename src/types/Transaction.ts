import { CurrentPrices } from "./Fugle";
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

//* List（Actions, PlanTypes, StopTypes, LogTypes）
export const actions = ["建倉", "加碼", "平倉", "出場"] as const
export const planTypes = ["多單", "空單"] as const
export const stopTypes = ["停損", "停利"] as const
export const logTypes = [
  "現股買進",
  "現股賣出",
  "融資買進",
  "融資賣出",
  "沖買",
  "沖賣",
] as const

// Reference
export type PlanType = (typeof planTypes)[number]
export type ActionType = (typeof actions)[number]
export type StopType = (typeof stopTypes)[number]
export type LogType = (typeof logTypes)[number]


export type ChartId = (typeof SUPPORTED_CHARTS)[number]

export interface ChartHandler {
  (userId: string, prisma: PrismaClient): Promise<any>
}

// Generic type for chart data (allows arrays, objects, or other structures)
export type GenericChartData = unknown;

export interface ProfitChartItem {
  month: string;
  TWSE: number;
  Me: number;
  相對表現: string;
  [key: string]: any; // Allow additional fields
}

export interface RealizedPnlChartItem {
  week: string;
  成交筆數: number;
  報酬率: string;
  獲利筆數: number;
  [key: string]: any;
}

export interface TradeFundBaseItem {
  name: string;
  value: number;
  [key: string]: any;
}

export interface TradeSummaryPosition {
  asset_id: string;
  asset_name: string;
  quantity: number;
  cost: number;
  [key: string]: any;
}

export interface TradeSummaryAsset {
  id: string; // User ID
  totalCost: number;
  totalMarketPrice: number;
  position: TradeSummaryPosition[];
  [key: string]: any;
}

export interface TradeSummaryData {
  asset: TradeSummaryAsset;
  currentPrices: CurrentPrices;
  [key: string]: any;
}

export interface TradeLogItem {
  id: string; // Transaction ID
  type: string;
  action: string;
  target: {
    symbol: string;
    name: string;
  };
  date: string;
  price: number;
  quantity: number;
  comment?: string;
  [key: string]: any;
}

export interface TradePlanItem {
  id: string // Plan ID
  type: PlanType // "多單" or "空單"
  target: {
    symbol?: string
    name?: string
  }
  action: ActionType 
  entryPrice: number
  targetPrice: number
  stop: {
    type: StopType // "停損" or "停利"
    price: number
  }
  expectation: number
  isExecuted: boolean
  comment?: string
  [key: string]: any
}

export interface GoalProgressItem {
  name: string;
  value: number;
  color: string;
  actualValue: number;
  [key: string]: any;
}

// ChartData: Maps chart IDs to their data (flexible)
export type ChartData = Record<string, GenericChartData> & {
  // Optional specific types for known charts
  ProfitChart?: ProfitChartItem[];
  RealizedPnlChart?: RealizedPnlChartItem[];
  TradeFundBase?: TradeFundBaseItem[];
  TradeSummary?: TradeSummaryData;
  TradeLog?: TradeLogItem[];
  TradePlan?: TradePlanItem[];
  GoalProgress?: GoalProgressItem[];
};