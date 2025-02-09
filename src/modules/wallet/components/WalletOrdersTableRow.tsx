import {
  Avatar,
  Chip,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { utils } from 'ethers';
import moment from 'moment';
import { useMemo } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import Link from '../../../components/Link';
import MomentFromNow from '../../../components/MomentFromNow';
import { useTokenList } from '../../../hooks/blockchain';
import { useCurrency } from '../../../hooks/currency';
import { OrderBookItem } from '../../../types/nft';
import { OrderDirection } from '../../../types/orderbook';
import {
  getNetworkSlugFromChainId,
  isAddressEqual,
} from '../../../utils/blockchain';

interface Props {
  order: OrderBookItem;
}

export function WalletOrdersTableRow({ order }: Props) {
  const currency = useCurrency();

  const tokens = useTokenList({
    chainId: parseInt(order.chainId),
    includeNative: true,
  });

  const token = tokens.find((t) => isAddressEqual(t.address, order.erc20Token));

  const amountRow = useMemo(() => {
    if (token) {
      return (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          alignContent="center"
        >
          <Avatar src={token.logoURI} sx={{ width: 'auto', height: '1rem' }} />
          <Typography variant="inherit">
            <FormattedNumber
              value={parseFloat(
                utils.formatUnits(order.order.erc20TokenAmount, token.decimals)
              )}
              maximumFractionDigits={6}
            />{' '}
            {token.symbol.toUpperCase()}
          </Typography>
        </Stack>
      );
    }
    return (
      <FormattedMessage id="unknown.token" defaultMessage={'Unknown token'} />
    );
  }, [order, token]);

  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/order/${getNetworkSlugFromChainId(order.asset?.chainId)}/${
            order?.order.nonce
          }`}
        >
          {order?.order?.nonce.substring(order?.order?.nonce.length - 8)}
        </Link>
      </TableCell>
      <TableCell>
        <Link
          href={`/asset/${getNetworkSlugFromChainId(order.asset?.chainId)}/${
            order.asset?.contractAddress
          }/${order.asset?.id}`}
        >
          {order.asset?.metadata?.name || (
            <FormattedMessage id="unknown.name" defaultMessage="Unknown name" />
          )}
        </Link>
      </TableCell>
      <TableCell>
        {order.asset?.collectionName || (
          <FormattedMessage
            id="unknown.collection"
            defaultMessage="Unknown collection"
          />
        )}
      </TableCell>

      <TableCell>
        {order.order.direction === OrderDirection.Buy ? (
          <FormattedMessage id="offer" defaultMessage="Offer" />
        ) : (
          <FormattedMessage id="Listing" defaultMessage="Listing" />
        )}
      </TableCell>
      <TableCell>
        <FormattedNumber
          value={order.usdValue || 0}
          style="currency"
          currency={currency.toUpperCase()}
          minimumFractionDigits={2}
          maximumFractionDigits={2}
        />
      </TableCell>
      <TableCell>{amountRow}</TableCell>
      <TableCell>
        <MomentFromNow
          from={moment.unix(parseInt(order?.order.expiry || '0'))}
        />
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          color={
            moment.unix(parseInt(order?.order.expiry || '0')).isBefore(moment())
              ? 'error'
              : 'default'
          }
          label={
            moment
              .unix(parseInt(order?.order.expiry || '0'))
              .isBefore(moment()) ? (
              <FormattedMessage id="expired" defaultMessage="Expired" />
            ) : (
              <FormattedMessage id="open" defaultMessage="Open" />
            )
          }
        />
      </TableCell>
    </TableRow>
  );
}

export default WalletOrdersTableRow;
