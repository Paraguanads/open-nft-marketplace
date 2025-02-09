export enum SwapSteps {
  Start,
  StartApproval,
  WaitingWalletApproval,
  FinishApproval,
  StartSwap,
  WaitingWalletSwap,
  FinishSwap,
}

export enum TraderOrderStatus {
  Open = 'open',
  Filled = 'filled',
  Expired = 'expired',
  Cancelled = 'cancelled',
  All = 'all',
}

export enum TraderOrderVisibility {
  Public = 'public',
  Private = 'private',
}

export enum NetworkName {
  ETH = 'eth',
/*   BSC = 'bsc', */
  POLYGON = 'polygon',
  AVAX = 'avax',
  FANTOM = 'ftm',
  ROPSTEN = 'ropsten',
  RINKEBY = 'rinkeby',
  MUMBAI = 'mumbai',
  OPTMISM = 'optimism',
  CELO = 'celo',
}

export enum ChainId {
  ETHEREUM = 1,
  ROPSTEN = 3,
/*   BSC = 56, */
  POLYGON = 137,
  AVALANCHE = 43114,
  FANTOM = 250,
  RINKEBY = 4,
  MUMBAI = 80001,
  OPTIMISM = 10,
  ARBITRUM = 42161,
  CELO = 42220,
  SEPOLIA = 11155111,
  BASE = 8453,
  GOERLI = 5
}

export enum NFTType {
  ERC1155 = 'ERC1155',
  ERC721 = 'ERC721',
}

export enum SellOrBuy {
  All = 'all',
  Sell = 'sell',
  Buy = 'buy',
}
