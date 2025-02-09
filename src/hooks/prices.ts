import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  COINGECKO_PLATFORM_ID, 
  NATIVE_TOKEN_COINGECKO_IDS,
  isSupportedChainId 
} from '../constants';
import { useWeb3React } from '@web3-react/core';

const BASE_URL = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 30000;

export function useTokenPrices(tokenAddresses: string[]) {
  const { chainId } = useWeb3React();
  
  return useQuery(
    ['tokenPrices', tokenAddresses, chainId],
    async () => {
      if (!tokenAddresses.length || !chainId || !isSupportedChainId(chainId)) {
        return {};
      }

      const platformId = COINGECKO_PLATFORM_ID[chainId];

      const response = await axios.get(
        `${BASE_URL}/simple/token_price/${platformId}`,
        {
          params: {
            contract_addresses: tokenAddresses.join(','),
            vs_currencies: 'usd',
            include_24h_change: true
          },
          timeout: 10000
        }
      );
      
      return response.data;
    },
    {
      staleTime: CACHE_DURATION,
      cacheTime: CACHE_DURATION * 2,
      enabled: tokenAddresses.length > 0 && Boolean(chainId),
      retry: 3
    }
  );
}

export function useNativeTokenPrice() {
  const { chainId } = useWeb3React();
  
  return useQuery(
    ['nativeTokenPrice', chainId],
    async () => {
      if (!chainId || !isSupportedChainId(chainId)) return null;
      
      const nativeTokenId = NATIVE_TOKEN_COINGECKO_IDS[chainId];
      if (!nativeTokenId) return null;

      const response = await axios.get(
        `${BASE_URL}/simple/price`,
        {
          params: {
            ids: nativeTokenId,
            vs_currencies: 'usd',
            include_24h_change: true
          },
          timeout: 10000
        }
      );
      
      return response.data[nativeTokenId];
    },
    {
      staleTime: CACHE_DURATION,
      cacheTime: CACHE_DURATION * 2,
      enabled: Boolean(chainId),
      retry: 3
    }
  );
} 