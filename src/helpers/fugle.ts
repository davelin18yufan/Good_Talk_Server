// utils/marketData.ts
import axios, { AxiosError, AxiosInstance } from "axios"
import {
  FugleSnapshotQuotesResponse,
  CurrentPrices,
  CurrentPricesItem,
} from "@/types/Fugle"

const BASE_URL = "https://api.fugle.tw/marketdata/v1.0/stock"
const API_KEY = process.env.FUGLE_API_KEY!

export const fugleClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-API-KEY": API_KEY,
  },
})

// In-memory cache for prices to avoid frequent API calls
const priceCache: Map<
  string,
  { price: number; name: string; timestamp: number }
> = new Map()
const CACHE_TTL = 60 * 1000 // 1 minute TTL

// Headers for API requests
const headers = {
  "X-API-KEY": API_KEY!,
}

/**
 * Fetch price for a single stock
 * @param symbol - Stock symbol
 * @returns - Current price of the stock
 */
export async function fetchMarketPrice(symbol: string): Promise<number> {
  // Check cache
  const cached = priceCache.get(symbol)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price
  }

  try {
    const response = await fugleClient.get<FugleSnapshotQuotesResponse>(
      `/snapshot/quotes?symbols=${symbol}`
    )
    const quote = response.data.data[0]
    if (!quote) {
      throw new Error(`No quote found for symbol ${symbol}`)
    }

    // Cache the price and name
    const price = quote.lastPrice || quote.closePrice
    priceCache.set(symbol, { price, name: quote.name, timestamp: Date.now() })

    return price
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error)
    return 0 // Fallback value
  }
}

/**
 * Fetch prices for multiple stocks (batch request)
 * @param symbols - Array of stock symbols
 * @returns - Array of current prices for the stocks
 */
export async function getPositionCurrentPrices(
  symbols: string[]
): Promise<CurrentPrices> {
  if (!symbols.length) return []

  // Check cache for all symbols
  const cachedPrices: CurrentPrices = []
  const symbolsToFetch: string[] = []

  for (const symbol of symbols) {
    const cached = priceCache.get(symbol)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      cachedPrices.push({
        symbol,
        name: cached.name,
        closePrice: cached.price,
      })
    } else {
      symbolsToFetch.push(symbol)
    }
  }

  if (!symbolsToFetch.length) return cachedPrices

  try {
    const response = await fugleClient.get<FugleSnapshotQuotesResponse>(
      `/snapshot/quotes?symbols=${symbolsToFetch.join(",")}`
    )

    const prices: CurrentPrices = response.data.data.map((quote) => {
      const price = quote.lastPrice || quote.closePrice
      // Cache the price and name
      priceCache.set(quote.symbol, {
        price,
        name: quote.name,
        timestamp: Date.now(),
      })

      return {
        symbol: quote.symbol,
        name: quote.name,
        closePrice: price,
      }
    })

    // Combine cached and fetched prices
    return [...cachedPrices, ...prices]
  } catch (error) {
    console.error(
      `Failed to fetch prices for symbols ${symbolsToFetch.join(",")}:`,
      error
    )
    return cachedPrices // Return cached prices if available
  }
}
