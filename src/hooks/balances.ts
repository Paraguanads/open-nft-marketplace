import type { SwappableAssetV4 } from '@traderxyz/nft-swap-sdk';
import { useWeb3React } from '@web3-react/core';
import { Contract, BigNumber } from 'ethers';
import type { providers } from 'ethers';
import { useCallback } from 'react';
import { useMutation, UseMutationOptions, useQuery } from 'react-query';
import { ZEROEX_NATIVE_TOKEN_ADDRESS } from '../constants';
import { ERC20Abi } from '../constants/abis';
import {
  getERC20Balances,
  getERC20WithProxyUnlockedBalances
} from '../services/balances';
import { Token, TokenBalance } from '../types/blockchain';
import { useTokenList } from './blockchain';
import { useTokenPrices, useNativeTokenPrice } from './prices';
import { useCoinPricesQuery } from './currency';
import { utils } from 'ethers';

export const GET_ERC20_BALANCES = 'GET_ERC20_BALANCES';
export const GET_ERC20_BALANCE = 'GET_ERC20_BALANCE';
export const GET_NATIVE_BALANCE = 'GET_NATIVE_BALANCES';

type SelectCalback = (data?: TokenBalance[]) => TokenBalance[] | undefined;

export const selectNativeCurrency: SelectCalback = (data?: TokenBalance[]) =>
  data?.filter((t) => t.token.address === ZEROEX_NATIVE_TOKEN_ADDRESS);

interface BalancesQueryOptions {
  showEmptyBalances?: boolean;
  select?: (data: TokenBalance[]) => TokenBalance[] | undefined;
}

export const useERC20BalancesQuery = (
  optionsOrSelect?: 
    | BalancesQueryOptions 
    | boolean 
    | ((data: TokenBalance[]) => TokenBalance[] | undefined)
) => {
  const { provider, account, chainId } = useWeb3React();
  const tokens = useTokenList({ chainId, includeNative: true });
  const { data: prices } = useCoinPricesQuery({ includeNative: true });

  const normalizedOptions: BalancesQueryOptions = typeof optionsOrSelect === 'function' 
    ? { select: optionsOrSelect, showEmptyBalances: true }
    : typeof optionsOrSelect === 'boolean'
    ? { showEmptyBalances: optionsOrSelect }
    : { showEmptyBalances: true, ...optionsOrSelect };

  return useQuery(
    ['erc20Balances', account, chainId, normalizedOptions.showEmptyBalances],
    async () => {
      if (!provider || !account || !chainId || !tokens) {
        return [];
      }

      const balances = await getERC20Balances(account, tokens, chainId, provider);
      
      const balancesWithPrices = balances.map(balance => {
        const tokenAddress = balance.token.address.toLowerCase();
        const nativeTokenAddress = ZEROEX_NATIVE_TOKEN_ADDRESS.toLowerCase();
        
        // Determinar precio basado en el tipo de token
        let price = 0;
        if (tokenAddress === nativeTokenAddress || 
            ['ETH', 'MATIC', 'BNB', 'AVAX', 'FTM'].includes(balance.token.symbol)) {
          price = prices?.[nativeTokenAddress]?.usd || 0;
        } else if (['USDC', 'USDT', 'DAI'].includes(balance.token.symbol)) {
          price = 1;
        } else {
          price = prices?.[tokenAddress]?.usd || 0;
        }

        const valueUSD = price * parseFloat(
          utils.formatUnits(balance.balance || '0', balance.token.decimals)
        );

        return {
          ...balance,
          priceUSD: price,
          valueUSD
        };
      });

      return normalizedOptions.showEmptyBalances 
        ? balancesWithPrices
        : balancesWithPrices.filter(b => b.valueUSD > 0);
    },
    {
      enabled: Boolean(provider && account && chainId),
      staleTime: 30000,
      cacheTime: 60000
    }
  );
};

export const useERC20BalancesProxyAllowancesQuery = (
  select?: SelectCalback
) => {
  const { provider, account, chainId } = useWeb3React();
  const tokens = useTokenList({ chainId, includeNative: true });

  return useQuery(
    [GET_ERC20_BALANCES, account, chainId, tokens],
    () => {
      if (
        provider === undefined ||
        account === undefined ||
        chainId === undefined ||
        tokens === undefined
      ) {
        return;
      }
      if (tokens.length === 0) {
        return [];
      }
      return getERC20WithProxyUnlockedBalances(
        account,
        tokens,
        chainId,
        provider
      );
    },
    { enabled: provider !== undefined, select, suspense: true }
  );
};

export const useSelectNativeBalancesQuery = () => {
  return useERC20BalancesQuery(selectNativeCurrency);
};

export const useSelectERC20BalancesQuery = (tokens: Token[]) => {
  const filterTokensCallback = useCallback(
    (data?: TokenBalance[]) => data?.filter((t) => tokens.includes(t.token)),
    [tokens]
  );

  return useERC20BalancesQuery(filterTokensCallback);
};

// We use this if we need only to return the native balance
export const useNativeBalanceQuery = () => {
  const { provider, account, chainId } = useWeb3React();
  return useQuery(
    [GET_NATIVE_BALANCE, account, chainId],
    async () => {
      if (
        provider === undefined ||
        account === undefined ||
        chainId === undefined
      ) {
        return;
      }
      const balances = await getERC20Balances(account, [], chainId, provider);
      return balances[0];
    },
    { enabled: provider !== undefined }
  );
};

// We use this if we need only a token balance
export const useERC20BalanceQuery = (token: Token) => {
  const { provider, account, chainId } = useWeb3React();
  return useQuery(
    [GET_ERC20_BALANCE, account, chainId],
    async () => {
      if (
        provider === undefined ||
        account === undefined ||
        chainId === undefined
      ) {
        return;
      }
      const balances = await getERC20Balances(
        account,
        [token],
        chainId,
        provider
      );
      return balances.filter((tb) => tb.token === token)[0];
    },
    { enabled: provider !== undefined }
  );
};

export function useErc20ApproveMutation(
  provider?: providers.Web3Provider,
  onSuccess?: (hash: string, asset: SwappableAssetV4) => void,
  options?: Omit<UseMutationOptions, any>
) {
  const mutation = useMutation(
    async ({
      spender,
      amount,
      tokenAddress,
    }: {
      spender: string;
      amount: BigNumber;
      tokenAddress?: string;
    }) => {
      if (!provider || tokenAddress === undefined) {
        return undefined;
      }

      const contract = new Contract(
        tokenAddress,
        ERC20Abi,
        provider.getSigner()
      );

      const tx = await contract.approve(spender, amount);

      if (onSuccess) {
        onSuccess(tx.hash, {
          type: 'ERC20',
          amount: amount.toString(),
          tokenAddress,
        });
      }

      return await tx.wait();
    },
    options
  );

  return mutation;
}

export const useERC20BalancesWithPricesQuery = (select?: SelectCalback) => {
  const { provider, account, chainId } = useWeb3React();
  const tokens = useTokenList({ chainId, includeNative: true });
  const { data: tokenPrices } = useTokenPrices(
    tokens?.filter(t => t.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
      .map(t => t.address) || []
  );
  const { data: nativePrice } = useNativeTokenPrice();

  return useQuery(
    [GET_ERC20_BALANCES, account, chainId, tokens],
    async () => {
      if (!provider || !account || !chainId || !tokens) {
        return [];
      }

      const balances = await getERC20Balances(account, tokens, chainId, provider);
      
      return balances.map(balance => ({
        ...balance,
        priceUSD: balance.token.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
          ? nativePrice?.usd
          : tokenPrices?.[balance.token.address.toLowerCase()]?.usd || 0
      }));
    },
    { 
      enabled: Boolean(provider && tokens?.length), 
      select,
      suspense: true,
      staleTime: 30000,
      cacheTime: 60000
    }
  );
};
