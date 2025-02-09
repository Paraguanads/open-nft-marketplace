import { ChainId } from '../constants/enum';
import { useWeb3React } from '@web3-react/core';
import axios from 'axios';
import { useAtom, useAtomValue } from 'jotai';
import { useQuery } from 'react-query';
import {
  COINGECKO_ENDPOIT,
  COINGECKO_PLATFORM_ID,
  ZEROEX_NATIVE_TOKEN_ADDRESS,
  isSupportedPlatform
} from '../constants';
import { NETWORKS } from '../constants/chain';
import { getCoinPrices, getTokenPrices, getNativeTokenPrice } from '../services/currency';
import { currencyAtom } from '../state/atoms';
import { useTokenList } from './blockchain';
import { isSupportedChainId, SupportedChainId } from '../constants';
import { PriceResponse } from '../types/api';

export function useCurrency(): string {
  return useAtomValue(currencyAtom) || 'usd';
}

export const useCoinPricesQuery = ({
  includeNative = true
}: {
  includeNative?: boolean;
}) => {
  const { chainId: web3ChainId } = useWeb3React();
  const tokens = useTokenList({ chainId: web3ChainId, includeNative });
  const currency = useCurrency();

  return useQuery(
    ['coinPrices', web3ChainId, tokens?.map(t => t.address).join(','), currency],
    async () => {
      if (!web3ChainId || !tokens?.length) return {};

      let prices: PriceResponse = {};

      const chainId = web3ChainId as unknown as ChainId;

      if (includeNative && isSupportedPlatform(chainId)) {
        const nativePrice = await getNativeTokenPrice(chainId, currency);
        if (nativePrice) {
          prices[ZEROEX_NATIVE_TOKEN_ADDRESS.toLowerCase()] = nativePrice;
        }
      }

      if (tokens.length > 0) {
        const tokenPrices = await getTokenPrices({
          chainId,
          addresses: tokens.map(t => t.address.toLowerCase()),
          currency
        });
        prices = { ...prices, ...tokenPrices };
      }

      return prices;
    },
    {
      enabled: Boolean(web3ChainId) && tokens?.length > 0,
      staleTime: 30000,
      refetchInterval: 30000
    }
  );
};

export const GET_FIAT_RATION = 'GET_FIAT_RATION';

export function useFiatRatio({
  chainId,
  contractAddress,
  currency,
}: {
  chainId?: number;
  contractAddress?: string;
  currency?: string;
}) {
  return useQuery(
    [GET_FIAT_RATION, chainId, contractAddress, currency],
    async () => {
      if (!chainId || !contractAddress || !currency) {
        return;
      }

      if (!isSupportedChainId(chainId)) {
        return;
      }

      const supportedChainId: SupportedChainId = chainId;
      const platformId = COINGECKO_PLATFORM_ID[supportedChainId];

      if (!platformId) {
        return;
      }

      const response = await axios.get(
        `${COINGECKO_ENDPOIT}/simple/token_price/${platformId}?contract_addresses=${contractAddress}&vs_currencies=${currency}`
      );

      return response.data[contractAddress][currency];
    }
  );
}

export const GET_NATIVE_COIN_PRICE = 'GET_NATIVE_COIN_PRICE';

export const useNativeCoinPriceQuery = () => {
  const { provider, chainId } = useWeb3React();

  const [currency] = useAtom(currencyAtom);
  return useQuery(
    [GET_NATIVE_COIN_PRICE, chainId, currency],
    async () => {
      if (provider === undefined || chainId === undefined) {
        return;
      }

      const activeNetwork = NETWORKS[chainId];
      if (activeNetwork && activeNetwork.coingeckoId) {
        const nativePrice = await getCoinPrices({
          coingeckoIds: [activeNetwork.coingeckoId],
          currency,
        });
        if (nativePrice[`${activeNetwork.coingeckoId}`]) {
          return nativePrice[`${activeNetwork.coingeckoId}`];
        }
      }
    },
    { enabled: provider !== undefined, suspense: true }
  );
};
