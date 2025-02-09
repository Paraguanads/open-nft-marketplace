import moment from 'moment';
import { Currency, Language } from '../types/app';
import { Token } from '../types/blockchain';
import { ChainId } from './enum';

export const TRADER_ORDERBOOK_API = 'https://api.trader.xyz/orderbook/orders';

export const ZEROEX_NATIVE_TOKEN_ADDRESS =
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const MULTICALL_NATIVE_TOKEN_ADDRESS =
  '0x0000000000000000000000000000000000000000';

export const WRAPPED_ETHER_CONTRACT: { [key: number]: string } = {
  3: '0xc778417e063141139fce010982780140aa0cd5ab',
};

export const ETH_COIN: Token = {
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  address: ZEROEX_NATIVE_TOKEN_ADDRESS,
  logoURI: '',
  chainId: ChainId.ETHEREUM,
};

export const MATIC_COIN: Token = {
  name: 'Polygon',
  symbol: 'MATIC',
  decimals: 18,
  address: ZEROEX_NATIVE_TOKEN_ADDRESS,
  logoURI: '',
  chainId: ChainId.POLYGON,
};

export const MIN_ORDER_DATE_TIME = moment.duration(1, 'hour');

export const COINGECKO_ENDPOIT = 'https://api.coingecko.com/api/v3';

export const COIN_GECKO_API_URL = 'https://pro-api.coingecko.com/api/v3';
export const COIN_GECKO_API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

export function isSupportedChainId(chainId: number): chainId is SupportedChainId {
  return SUPPORTED_CHAINS.includes(chainId as SupportedChainId);
}

export type SupportedChainId = Extract<
  ChainId,
  | ChainId.ETHEREUM
  | ChainId.POLYGON
  | ChainId.OPTIMISM
  | ChainId.ARBITRUM
  | ChainId.BASE
  | ChainId.AVALANCHE
  | ChainId.FANTOM
  | ChainId.CELO
/*   | ChainId.BSC */
>;

export const BASE_URL = 'https://api.coingecko.com/api/v3';
export const CACHE_DURATION = 30000;

export const COINGECKO_PLATFORM_ID: Partial<Record<ChainId, string>> = {
  [ChainId.POLYGON]: 'polygon-pos',
  [ChainId.MUMBAI]: 'polygon-mumbai',
  [ChainId.OPTIMISM]: 'optimistic-ethereum',
  [ChainId.ARBITRUM]: 'arbitrum-one',
  [ChainId.BASE]: 'base',
  [ChainId.AVALANCHE]: 'avalanche-c-chain',
  [ChainId.FANTOM]: 'fantom',
  [ChainId.CELO]: 'celo',
/*   [ChainId.BSC]: 'binancecoin'
 */} as const;


export const isSupportedPlatform = (chainId: number): chainId is ChainId => {
  return chainId in COINGECKO_PLATFORM_ID;
};

export const SUPPORTED_CHAINS = [
  ChainId.ETHEREUM,
  ChainId.POLYGON,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM,
  ChainId.BASE,
  ChainId.AVALANCHE,
  ChainId.FANTOM,
  ChainId.CELO,
/*   ChainId.BSC
 */] as const;

export const NATIVE_TOKEN_COINGECKO_IDS: Record<SupportedChainId, string> = {
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.POLYGON]: 'matic-network',
  [ChainId.OPTIMISM]: 'ethereum',
  [ChainId.ARBITRUM]: 'ethereum',
  [ChainId.BASE]: 'ethereum',
  [ChainId.AVALANCHE]: 'avalanche-2',
  [ChainId.FANTOM]: 'fantom',
  [ChainId.CELO]: 'celo',
/*   [ChainId.BSC]: 'binancecoin'
 */} as const;

export const LANGUAGES: Language[] = [
  { name: 'English (US)', locale: 'en-US' },
  { name: 'Português (BR)', locale: 'pt-BR' },
  { name: 'Español (ES)', locale: 'es-ES' },
  { name: 'Čeština (CZ)', locale: 'cs-CZ' },
];

export const CURRENCIES: Currency[] = [{ symbol: 'usd', name: 'US Dollar' }];

export const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const WRAPPED_TOKENS: { [chainId: number]: string } = {
  [ChainId.ETHEREUM]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [ChainId.POLYGON]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  [ChainId.OPTIMISM]: '0x4200000000000000000000000000000000000006',
  [ChainId.ARBITRUM]: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  [ChainId.BASE]: '0x4200000000000000000000000000000000000006',
/*   [ChainId.BSC]: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
 */};

export const GET_COIN_PRICES = 'GET_COIN_PRICES';
