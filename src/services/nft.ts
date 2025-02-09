import type { CallInput } from '@indexed-finance/multicall';
import axios from 'axios';
import { Contract, utils } from 'ethers';
import type { providers } from 'ethers';

import { ERC1155Abi, ERC721Abi } from '../constants/abis';
import { Asset, AssetMetadata, Collection, OrderBookItem } from '../types/nft';
import { ipfsUriToUrl } from '../utils/ipfs';
import { getMulticallFromProvider } from './multical';

import { TRADER_ORDERBOOK_API } from '../constants';
import { TraderOrderFilter } from '../utils/types';
import { isENSContract } from '../utils/nfts';

const ENS_BASE_URL = 'https://metadata.ens.domains';

const metadataENSapi = axios.create({ baseURL: ENS_BASE_URL });

const METADATA_TIMEOUT = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const retry = async (fn: () => Promise<any>, retries: number): Promise<any> => {
  try {
    return await Promise.race([
      fn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), METADATA_TIMEOUT)
      )
    ]);
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retry(fn, retries - 1);
    }
    throw error;
  }
};

export async function getAssetData(
  provider?: providers.JsonRpcProvider,
  contractAddress?: string,
  id?: string
): Promise<Asset | undefined> {
  if (!provider || !contractAddress || !id) {
    return;
  }

  try {
    if (isENSContract(contractAddress)) {
      const data = await retry(
        () => getENSAssetData(provider, contractAddress, id),
        MAX_RETRIES
      );
      return data;
    }

    const multicall = await getMulticallFromProvider(provider);
    const iface = new utils.Interface(ERC721Abi);
    let calls: CallInput[] = [];
    calls.push({
      interface: iface,
      target: contractAddress,
      function: 'ownerOf',
      args: [id],
    });

    calls.push({
      interface: iface,
      target: contractAddress,
      function: 'tokenURI',
      args: [id],
    });

    calls.push({
      interface: iface,
      target: contractAddress,
      function: 'name',
    });

    calls.push({
      interface: iface,
      target: contractAddress,
      function: 'symbol',
    });

    const response = await retry(
      async () => multicall?.multiCall(calls),
      MAX_RETRIES
    );

    if (response) {
      const [, results] = response;
      
      if (!results || results.length < 4) {
        throw new Error('Incomplete metadata response');
      }

      const [owner, tokenURI, name, symbol] = results;
      
      if (!owner || !tokenURI) {
        throw new Error('Missing critical metadata');
      }

      const { chainId } = await provider.getNetwork();

      return {
        owner,
        tokenURI,
        collectionName: name || 'Unknown Collection',
        symbol: symbol || 'Unknown',
        id,
        contractAddress,
        chainId,
      };
    }
    
    throw new Error('No response from multicall');
    
  } catch (error) {
    console.error('Error fetching asset data:', error);
    throw new Error(`Failed to fetch asset data: ${(error as Error).message}`);
  }
}

export async function getENSAssetData(
  provider?: providers.JsonRpcProvider,
  contractAddress?: string,
  id?: string
): Promise<Asset | undefined> {
  if (!provider || !contractAddress || !id) {
    return;
  }

  const response = await metadataENSapi.get(`/mainnet/${contractAddress}/${id}`);
  const data = response.data;
  const iface = new utils.Interface(ERC721Abi);
  const contract = new Contract(contractAddress, iface, provider);
  const owner = await contract.ownerOf(id);

  if (data) {
    const { chainId } = await provider.getNetwork();
    return {
      owner,
      tokenURI: `${ENS_BASE_URL}/mainnet/${contractAddress}/${id}`,
      collectionName: data.name,
      symbol: 'ENS',
      id,
      contractAddress,
      chainId,
    };
  }
}

export async function getCollectionData(
  provider?: providers.JsonRpcProvider,
  contractAddress?: string
): Promise<Collection | undefined> {
  if (!provider || !contractAddress) {
    return;
  }

  const multicall = await getMulticallFromProvider(provider);
  const iface = new utils.Interface(ERC721Abi);
  let calls: CallInput[] = [];

  calls.push({
    interface: iface,
    target: contractAddress,
    function: 'name',
  });

  calls.push({
    interface: iface,
    target: contractAddress,
    function: 'symbol',
  });

  const response = await multicall?.multiCall(calls);
  if (response) {
    const [, results] = response;

    const name = results[0];
    const symbol = results[1];

    const { chainId } = await provider.getNetwork();

    return {
      collectionName: name,
      symbol,
      contractAddress,
      chainId,
    };
  }
}

export async function getAssetsFromOrderbook(
  provider?: providers.JsonRpcProvider,
  filters?: TraderOrderFilter
) {
  if (provider === undefined || filters?.nftToken === undefined) {
    return;
  }

  const orderbook = await getOrderbookOrders(filters);

  const ids = new Set<string>(
    orderbook.orders.map((order) => order.nftTokenId)
  );

  const assets = await getAssetsData(
    provider,
    filters.nftToken,
    Array.from(ids)
  );

  return assets;
}

export async function getAssetsData(
  provider: providers.JsonRpcProvider,
  contractAddress: string,
  ids: string[],
  account?: string,
  isERC1155 = false
): Promise<Asset[] | undefined> {
  try {
    const assetsCache = new Map<string, Asset>();
    
    const batchSize = 20;
    const assets: Asset[] = [];
    
    if (isERC1155 && !account) {
      throw new Error('Account is required for ERC1155 tokens');
    }


    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      
      const multicall = await getMulticallFromProvider(provider);
      const iface = new utils.Interface(isERC1155 ? ERC1155Abi : ERC721Abi);
      
      const calls: CallInput[] = [];
      
      calls.push({
        interface: iface,
        target: contractAddress,
        function: 'name'
      });

      
      calls.push({
        interface: iface,
        target: contractAddress,
        function: 'symbol'
      });

      for (const id of batch) {
        if (!assetsCache.has(id)) {
          calls.push({
            interface: iface,
            target: contractAddress,
            function: isERC1155 ? 'balanceOf' : 'ownerOf',
            args: isERC1155 ? [account, id] : [id]
          });
          
          calls.push({
            interface: iface,
            target: contractAddress,
            function: 'tokenURI',
            args: [id]
          });
        }
      }

      const response = await retry(
        async () => multicall?.multiCall(calls),
        MAX_RETRIES
      );

      if (response) {
        const [, results] = response;
        const name = results[0];
        const symbol = results[1];
        
        let resultIndex = 2;
        for (const id of batch) {
          if (!assetsCache.has(id)) {
            const owner = results[resultIndex++];
            const tokenURI = results[resultIndex++];
            
            const { chainId } = await provider.getNetwork();
            
            const asset: Asset = {
              owner,
              tokenURI,
              collectionName: name || 'Unknown Collection',
              symbol: symbol || 'Unknown',
              id,
              contractAddress,
              chainId,
              lastUpdated: Date.now()
            };
            
            assets.push(asset);
            assetsCache.set(id, asset);
          } else {
            assets.push(assetsCache.get(id)!);
          }
        }
      }
    }
    
    return assets;
    
  } catch (error) {
    console.error('Error fetching assets data:', error);
    throw new Error(`Failed to fetch assets data: ${(error as Error).message}`);
  }
}

export async function getAssetMetadata(
  tokenURI: string,
  defaultValue?: AssetMetadata
) {
  if (tokenURI?.startsWith('data:application/json;base64')) {
    const jsonURI = Buffer.from(tokenURI.substring(29), "base64").toString();
    return JSON.parse(jsonURI);
  }
  try {
    const response = await axios.get<AssetMetadata>(
      ipfsUriToUrl(tokenURI || ''),
      {
        timeout: 5000,
      }
    );
    return response.data;
  } catch (e) {
    return defaultValue;
  }
}

export interface OrderbookResponse {
  orders: OrderBookItem[];
}

export function getOrderbookOrders(orderFilter: TraderOrderFilter) {
  return axios
    .get<OrderbookResponse>(`${TRADER_ORDERBOOK_API}`, { params: orderFilter })
    .then((resp) => resp.data);
}
