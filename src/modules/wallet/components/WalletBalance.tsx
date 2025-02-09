import { Typography } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { useCoinPricesQuery } from '../../../hooks/currency';
import { Token } from '../../../types/blockchain';
import { utils } from 'ethers';

interface Props {
  token?: Token;
  balance?: string;
}

export function WalletBalance({ token, balance }: Props) {
  const { data: prices } = useCoinPricesQuery({ includeNative: true });
  
  const tokenPrice = useMemo(() => {
    if (!prices || !token) return 0;
    const tokenAddress = token.address.toLowerCase();
    
    if (token.symbol === 'USDC' || token.symbol === 'USDT' || token.symbol === 'DAI') {
      return prices[tokenAddress]?.usd || 1;
    }
    
    return prices[tokenAddress]?.usd || 0;
  }, [prices, token]);

  const balanceInUSD = useMemo(() => {
    if (!balance || !token) return '0.00';
    const numericBalance = parseFloat(utils.formatUnits(balance, token.decimals));
    return (numericBalance * (tokenPrice || 0)).toFixed(2);
  }, [balance, tokenPrice, token]);

  return (
    <div>
      <Typography variant="body1">
        {token && balance ? utils.formatUnits(balance, token.decimals) : '0'} {token?.symbol}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        ${balanceInUSD} USD
      </Typography>
    </div>
  );
} 