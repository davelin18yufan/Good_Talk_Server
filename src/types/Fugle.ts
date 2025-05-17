export interface FugleQuote {
  symbol: string
  name: string
  lastPrice: number
  closePrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  tradeVolume: number
  tradeValue: number
  lastUpdated: string // ISO 8601 timestamp
}

export interface FugleSnapshotQuotesResponse {
  data: FugleQuote[]
}

export interface CurrentPricesItem {
  symbol: string
  name: string
  closePrice: number
}

export type CurrentPrices = CurrentPricesItem[]
