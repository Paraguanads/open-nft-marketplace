import { NFTType, SellOrBuy } from '../constants/enum';
import { Token } from './blockchain';

export interface SwapApiOrder {
  direction: number;
  erc20Token: string;
  erc20TokenAmount: string;
  erc721Token: string;
  erc721TokenId: string;
  erc721TokenProperties: any[];
  expiry: string;
  fees: any[];
  maker: string;
  nonce: string;
  signature: {
    r: string;
    s: string;
    signatureType: number;
    v: number;
  };
  taker: string;
}

export interface OrderBookItem {
  erc20Token: string;
  erc20TokenAmount: string;
  nftToken: string;
  nftTokenId: string;
  nftTokenAmount: string;
  nftType: NFTType;
  sellOrBuyNft: SellOrBuy;
  chainId: string;
  order: SwapApiOrder;
  orders?: SwapApiOrder[];
  asset?: Asset;
  token?: Token;
  usdValue?: number;
}

export interface Collection {
  chainId: number;
  contractAddress: string;
  collectionName: string;
  symbol: string;
  nftType?: NFTType;
}

export interface AssetError {
  message: string;
  code?: string;
  retries?: number;
  context?: {
    contractAddress: string;
    tokenId: string;
    chainId?: number;
  };
}

export interface Asset {
  id: string;
  chainId: number;
  contractAddress: string;
  owner: string;
  tokenURI: string;
  collectionName: string;
  symbol: string;
  type?: string;
  metadata?: AssetMetadata;
  error?: AssetError;
  lastUpdated?: number;
}

export interface AssetMetadata {
  name: string;
  image?: string;
  description?: string;
  attributes?: {
    display_type?: string;
    trait_type: string;
    value: string;
  }[];
}
