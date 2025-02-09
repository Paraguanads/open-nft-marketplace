export interface TokenPrice {
  usd: number;
  usd_24h_change?: number;
}

export interface PriceResponse {
  [tokenAddress: string]: TokenPrice;
}

export interface PriceCache {
  timestamp: number;
  data: PriceResponse;
}

export interface CoinGeckoResponse {
  [coinId: string]: TokenPrice;
} 