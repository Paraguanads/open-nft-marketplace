import type { AddEthereumChainParameter } from '@web3-react/types';
import { ChainId } from './enum';

const infuraKey = process.env.INFURA_API_KEY;

const ETH: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
};

const MATIC: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Matic',
  symbol: 'MATIC',
  decimals: 18,
};

const AVAX: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Avalanche',
  symbol: 'AVAX',
  decimals: 18,
};

const FTM: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Fantom',
  symbol: 'FTM',
  decimals: 18,
};

const CELO: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Celo',
  symbol: 'CELO',
  decimals: 18,
};

interface BasicChainInformation {
  urls: string[];
  name: string;
}

interface ExtendedChainInformation extends BasicChainInformation {
  nativeCurrency: AddEthereumChainParameter['nativeCurrency'];
  blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls'];
}

function isExtendedChainInformation(
  chainInformation: BasicChainInformation | ExtendedChainInformation | undefined
): chainInformation is ExtendedChainInformation {
  return !!chainInformation && !!(chainInformation as ExtendedChainInformation).nativeCurrency;
}

export function getAddChainParameters(
  chainId: ChainId
): AddEthereumChainParameter | number {
  const chainInformation = CHAINS[chainId];
  if (chainInformation && isExtendedChainInformation(chainInformation)) {
    return {
      chainId,
      chainName: chainInformation.name,
      nativeCurrency: chainInformation.nativeCurrency,
      rpcUrls: chainInformation.urls,
      blockExplorerUrls: chainInformation.blockExplorerUrls,
    };
  } else {
    return chainId;
  }
}

type ChainConfig = {
  [K in ChainId]?: BasicChainInformation | ExtendedChainInformation;
};

export const CHAINS: ChainConfig = {
  [ChainId.ETHEREUM]: {
    urls: [
      infuraKey ? `https://mainnet.infura.io/v3/${infuraKey}` : undefined,
      process.env.alchemyKey
        ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyKey}`
        : undefined,
      'https://cloudflare-eth.com',
    ].filter((url): url is string => url !== undefined),
    name: 'Ethereum Mainnet',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://etherscan.io'],
  },
  [ChainId.POLYGON]: {
    urls: [
      infuraKey
        ? `https://polygon-mainnet.infura.io/v3/${infuraKey}`
        : undefined,
      'https://polygon-rpc.com',
    ].filter((url): url is string => url !== undefined),
    name: 'Polygon Mainnet',
    nativeCurrency: MATIC,
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  [ChainId.OPTIMISM]: {
    urls: [
      infuraKey
        ? `https://optimism-mainnet.infura.io/v3/${infuraKey}`
        : undefined,
      'https://mainnet.optimism.io',
    ].filter((url): url is string => url !== undefined),
    name: 'Optimism',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  [ChainId.ARBITRUM]: {
    urls: [
      infuraKey
        ? `https://arbitrum-mainnet.infura.io/v3/${infuraKey}`
        : undefined,
      'https://arb1.arbitrum.io/rpc',
    ].filter((url): url is string => url !== undefined),
    name: 'Arbitrum One',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  [ChainId.BASE]: {
    urls: [
      'https://mainnet.base.org',
    ],
    name: 'Base',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://basescan.org'],
  },
  [ChainId.AVALANCHE]: {
    urls: [
      'https://api.avax.network/ext/bc/C/rpc',
    ],
    name: 'Avalanche',
    nativeCurrency: AVAX,
    blockExplorerUrls: ['https://snowtrace.io'],
  },
  [ChainId.FANTOM]: {
    urls: [
      'https://rpc.ftm.tools',
    ],
    name: 'Fantom Opera',
    nativeCurrency: FTM,
    blockExplorerUrls: ['https://ftmscan.com'],
  },
  [ChainId.CELO]: {
    urls: [
      'https://forno.celo.org',
    ],
    name: 'Celo',
    nativeCurrency: CELO,
    blockExplorerUrls: ['https://celoscan.io'],
  },
};

export const URLS: Record<ChainId, string[]> = Object.entries(CHAINS).reduce<Record<ChainId, string[]>>(
  (acc, [chainId, chainInfo]) => {
    const validURLs = chainInfo?.urls || [];
    if (validURLs.length) {
      acc[Number(chainId) as ChainId] = validURLs;
    }
    return acc;
  },
  {} as Record<ChainId, string[]>
);
