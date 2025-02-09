import { IconButton, Stack } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { SellOrBuy, TraderOrderStatus } from '../../../constants/enum';
import { useTokenList } from '../../../hooks/blockchain';
import { usePositionPaginator } from '../../../hooks/misc';
import { useAssetMetadataFromList, useOrderBook } from '../../../hooks/nft';
import WalletOrdersTable from './WalletOrdersTable';
import { useTokenPrices } from '../../../hooks/prices';
import { utils } from 'ethers';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface Props {
  filter: { sellOrBuy?: SellOrBuy; orderStatus?: TraderOrderStatus };
}

export function WalletOrders({ filter }: Props) {
  const { sellOrBuy, orderStatus } = filter;

  const { chainId, account, isActive } = useWeb3React();

  const paginator = usePositionPaginator();

  const tokens = useTokenList({ chainId, includeNative: true });

  const tokenAddresses = useMemo(() => 
    tokens.map(t => t.address.toLowerCase()),
    [tokens]
  );
  
  const { data: tokenPrices } = useTokenPrices(tokenAddresses);

  const { data: orders } = useOrderBook({
    chainId,
    offset: paginator.position.offset,
    limit: paginator.position.limit,
    maker: account,
    sellOrBuyNft: sellOrBuy,
    status: orderStatus !== TraderOrderStatus.All ? orderStatus : undefined,
  });

  const assetsQuery = useAssetMetadataFromList({
    chainId,
    offset: paginator.position.offset,
    limit: paginator.position.limit,
    maker: account,
    sellOrBuyNft: sellOrBuy,
    status: orderStatus !== TraderOrderStatus.All ? orderStatus : undefined,
  });

  const assets = assetsQuery.data;

  const ordersWithPrices = useMemo(() => {
    if (!orders?.orders || !tokenPrices) return [];
    
    return orders.orders.map(order => {
      const tokenAddress = order.erc20Token.toLowerCase();
      const price = tokenPrices[tokenAddress]?.usd || 0;
      const amount = utils.formatUnits(
        order.erc20TokenAmount,
        tokens.find(t => t.address.toLowerCase() === tokenAddress)?.decimals || 18
      );
      
      return {
        ...order,
        usdValue: price * parseFloat(amount)
      };
    });
  }, [orders, tokenPrices, tokens]);

  const ordersWithMetadata = useMemo(() => {
    if (ordersWithPrices && assets && tokens) {
      return ordersWithPrices.map((or) => {
        return {
          ...or,
          token: tokens.find(
            (t) => or.erc20Token.toLowerCase() === t.address.toLowerCase()
          ),
          asset: assets.find(
            (a) =>
              a.id === or.nftTokenId &&
              a.contractAddress.toLowerCase() === or.nftToken.toLowerCase()
          ),
        };
      });
    }
    return [];
  }, [assets, tokens, ordersWithPrices]);

  return (
    <Stack>
      <WalletOrdersTable orders={ordersWithMetadata} />
      <Stack direction="row" justifyContent="flex-end">
        <IconButton
          disabled={paginator.position.offset === 0}
          onClick={paginator.handlePrevious}
        >
          <NavigateBeforeIcon />
        </IconButton>
        <IconButton
          disabled={
            !isActive ||
            (orders !== undefined &&
              orders?.orders?.length < paginator.pageSize)
          }
          onClick={paginator.handleNext}
        >
          <NavigateNextIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}

export default WalletOrders;
