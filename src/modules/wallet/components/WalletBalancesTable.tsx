import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Switch,
  FormControlLabel,
} from '@mui/material';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';
import { QueryErrorResetBoundary } from 'react-query';
import { useERC20BalancesQuery } from '../../../hooks/balances';
import { useCoinPricesQuery, useCurrency } from '../../../hooks/currency';
import { useIsBalanceVisible } from '../../../hooks/misc';
import WalletTableRow from './WalletTableRow';

interface Props {
  isBalancesVisible: boolean;
}

function WalletBalancesTable({ isBalancesVisible }: Props) {
  const [showEmptyBalances, setShowEmptyBalances] = useState(true);
  const tokenBalancesQuery = useERC20BalancesQuery({ showEmptyBalances });
  const currency = useCurrency();

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={!showEmptyBalances}
              onChange={(e) => setShowEmptyBalances(!e.target.checked)}
            />
          }
          label={<FormattedMessage id="hideEmptyBalances" defaultMessage="Hide empty balances" />}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <FormattedMessage id="token" defaultMessage="Token" />
              </TableCell>
              <TableCell>
                <FormattedMessage id="total" defaultMessage="Total" />
              </TableCell>
              <TableCell>
                <FormattedMessage id="balance" defaultMessage="Balance" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokenBalancesQuery.data?.map((tokenBalance, index) => (
              <WalletTableRow
                key={index}
                tokenBalance={tokenBalance}
                isBalancesVisible={isBalancesVisible}
                currency={currency}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

function WalletTableSkeleton({ rows = 4 }: { rows: number }) {
  return (
    <Table>
      <TableBody>
        {new Array(rows).fill(null).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton />
            </TableCell>
            <TableCell>
              <Skeleton />
            </TableCell>
            <TableCell>
              <Skeleton />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function WalletBalances() {
  const isBalancesVisible = useIsBalanceVisible();

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary, error }) => (
            <Paper sx={{ p: 1 }}>
              <Stack justifyContent="center" alignItems="center">
                <Typography variant="h6">
                  <FormattedMessage
                    id="something.went.wrong"
                    defaultMessage="Oops, something went wrong"
                    description="Something went wrong error message"
                  />
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {String(error)}
                </Typography>
                <Button color="primary" onClick={resetErrorBoundary}>
                  <FormattedMessage
                    id="try.again"
                    defaultMessage="Try again"
                    description="Try again"
                  />
                </Button>
              </Stack>
            </Paper>
          )}
        >
          <Suspense fallback={<WalletTableSkeleton rows={4} />}>
            <WalletBalancesTable isBalancesVisible={isBalancesVisible} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export default WalletBalances;
