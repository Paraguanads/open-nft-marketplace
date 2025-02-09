import { ChainId } from '../constants/enum';
import axios from 'axios';
import { 
  BASE_URL, 
  CACHE_DURATION, 
  COINGECKO_PLATFORM_ID,
  NATIVE_TOKEN_COINGECKO_IDS,
  isSupportedPlatform,
  isSupportedChainId,
  SupportedChainId
} from '../constants';
import { PriceCache, PriceResponse, TokenPrice, CoinGeckoResponse } from '../types/api';
import { Token } from '../types/blockchain';

let priceCache: PriceCache = {
  timestamp: 0,
  data: {}
};

export const getTokenPrices = async ({
  chainId,
  addresses,
  currency = 'usd',
}: {
  chainId: ChainId;
  addresses: string[];
  currency: string;
}): Promise<PriceResponse> => {
  try {
    if (!isSupportedPlatform(chainId) || addresses.length === 0) {
      return {};
    }

    const now = Date.now();
    if (now - priceCache.timestamp < CACHE_DURATION) {
      return priceCache.data;
    }

    const platformId = COINGECKO_PLATFORM_ID[chainId];
    const validAddresses = addresses.filter(addr => 
      addr && addr.length === 42 && addr.startsWith('0x')
    );

    if (!platformId || validAddresses.length === 0) {
      return {};
    }

    const response = await axios.get<PriceResponse>(
      `${BASE_URL}/simple/token_price/${platformId}`,
      {
        params: {
          contract_addresses: validAddresses.join(',').toLowerCase(),
          vs_currencies: currency,
          include_24h_change: true
        },
        timeout: 10000
      }
    );

    priceCache = {
      timestamp: now,
      data: response.data
    };

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching token prices:', error.message);
    }
    return {};
  }
};

export const getNativeTokenPrice = async (
  chainId: ChainId,
  currency = 'usd'
): Promise<TokenPrice | null> => {
  try {
    if (!isSupportedChainId(chainId)) {
      return null;
    }

    const coingeckoId = NATIVE_TOKEN_COINGECKO_IDS[chainId];
    if (!coingeckoId) return null;

    const response = await axios.get<CoinGeckoResponse>(
      `${BASE_URL}/simple/price`,
      {
        params: {
          ids: coingeckoId,
          vs_currencies: currency,
          include_24h_change: true
        },
        timeout: 10000
      }
    );

    if (response.data[coingeckoId]) {
      return {
        usd: response.data[coingeckoId].usd,
        usd_24h_change: response.data[coingeckoId].usd_24h_change
      };
    }
    return null;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching native token price:', error.message);
    }
    return null;
  }
};

export const getCoinPrices = async ({
  coingeckoIds,
  currency = 'usd',
}: {
  coingeckoIds: string[];
  currency: string;
}): Promise<{ [key: string]: { [key: string]: number } }> => {
  const priceResponce = await axios.get(
    `${BASE_URL}/simple/price?ids=${coingeckoIds.concat(
      ','
    )}&vs_currencies=${currency}`
  );

  return priceResponce.data as { [key: string]: { [key: string]: number } };
};
