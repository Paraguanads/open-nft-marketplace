import {
  Avatar,
  Box,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { utils } from 'ethers';
import { useMemo } from 'react';
import { FormattedNumber } from 'react-intl';
import { TokenBalance } from '../../../types/blockchain';
import { ipfsUriToUrl } from '../../../utils/ipfs';
import { TOKEN_ICON_URL } from '../../../utils/token';
import { useCoinPricesQuery } from '../../../hooks/currency';

interface Props {
  isBalancesVisible: boolean;
  tokenBalance: TokenBalance;
  currency: string;
}

function WalletTableRow({
  tokenBalance,
  isBalancesVisible,
  currency,
}: Props) {
  const { chainId } = useWeb3React();
  const { token, balance } = tokenBalance;
  const { data: prices } = useCoinPricesQuery({ includeNative: true });

  const balanceUnits = useMemo(() => 
    utils.formatUnits(balance || '0', token.decimals),
    [balance, token.decimals]
  );

  const valueInUSD = useMemo(() => {
    if (!prices || !balance) return 0;
    const tokenAddress = token.address.toLowerCase();
    const price = token.symbol === 'USDC' || token.symbol === 'USDT' || token.symbol === 'DAI'
      ? prices[tokenAddress]?.usd || 1
      : prices[tokenAddress]?.usd || 0;
    
    return price * parseFloat(balanceUnits);
  }, [prices, token, balance, balanceUnits]);

  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{ width: 'auto', height: '2rem' }}
            src={
              token.logoURI
                ? ipfsUriToUrl(token.logoURI)
                : TOKEN_ICON_URL(token.address, chainId)
            }
          />
          <Box>
            <Typography variant="body1">{token.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {token.symbol}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        {isBalancesVisible ? (
          <FormattedNumber
            value={valueInUSD}
            style="currency"
            currency={currency.toUpperCase()}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        ) : (
          '*****'
        )}
      </TableCell>
      <TableCell>
        {isBalancesVisible ? (
          <>
            <FormattedNumber 
              value={Number(balanceUnits)} 
              maximumFractionDigits={6}
            /> {' '}
            {token.symbol}
          </>
        ) : (
          '*****'
        )}
      </TableCell>
    </TableRow>
  );
}

export default WalletTableRow;
