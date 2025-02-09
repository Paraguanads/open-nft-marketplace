import { utils } from 'ethers';
import { useMemo } from 'react';
import { FormattedNumber } from 'react-intl';
import { useERC20BalancesQuery } from '../../../hooks/balances';
import { useCoinPricesQuery } from '../../../hooks/currency';
import { useIsBalanceVisible } from '../../../hooks/misc';
import { ZEROEX_NATIVE_TOKEN_ADDRESS } from '../../../constants';

export function WalletTotalBalance() {
  const isBalancesVisible = useIsBalanceVisible();
  const { data: balances } = useERC20BalancesQuery();
  const { data: prices } = useCoinPricesQuery({ includeNative: true });

  const totalBalance = useMemo(() => {
    if (!balances || !prices) {
      return 0;
    }

    return balances.reduce((total, tb) => {
      const tokenAddress = tb.token.address.toLowerCase();
      const price = tokenAddress === ZEROEX_NATIVE_TOKEN_ADDRESS.toLowerCase()
        ? prices[tokenAddress]?.usd
        : prices[tokenAddress]?.usd || 1;
      
      const balance = parseFloat(utils.formatUnits(tb.balance || '0', tb.token.decimals));
      return total + (balance * (price || 0));
    }, 0);
  }, [balances, prices]);

  if (!isBalancesVisible) {
    return '*****';
  }

  return (
    <FormattedNumber
      value={totalBalance}
      style="currency"
      currency="USD"
      minimumFractionDigits={2}
      maximumFractionDigits={2}
    />
  );
}
