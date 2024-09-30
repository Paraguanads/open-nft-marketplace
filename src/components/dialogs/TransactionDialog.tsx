import { useIntl } from 'react-intl';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { transactionsAtom } from '../../state/atoms';
import {
  Transaction,
  TransactionMetadata,
  TransactionStatus,
  TransactionType,
} from '../../types/blockchain';
import { getBlockExplorerUrl } from '../../utils/blockchain';
import CloseCircle from '../icons/CloseCircle';
import ReceiptText from '../icons/ReceiptText';
import TickCircle from '../icons/TickCircle';
import TransactionTitle from '../TransactionTitle';

interface Props {
  hash?: string;
  metadata?: TransactionMetadata;
  type?: TransactionType;
  dialogProps: DialogProps;
  subtitle?: string;
  error?: Error;
}

export function TransactionDialog({
  dialogProps,
  hash,
  error,
  metadata,
  type,
}: Props) {
  const intl = useIntl();
  const { onClose } = dialogProps;
  const handleClose = () => onClose!({}, 'backdropClick');

  const transactions = useAtomValue(transactionsAtom);

  const txState: Transaction | undefined =
    hash !== undefined ? transactions[hash] : undefined;

  const renderTransactionState = useCallback(() => {
    if (txState !== undefined) {
      if (txState.status === TransactionStatus.Pending) {
        return <CircularProgress />;
      } else if (txState.status === TransactionStatus.Confirmed) {
        return <TickCircle color="success" fontSize="large" />;
      } else if (txState.status === TransactionStatus.Failed) {
        return <CloseCircle color="error" />;
      }
    } else {
      return <CircularProgress />;
    }
  }, [txState]);

  const renderTitle = useCallback(() => {
    if (txState !== undefined) {
      if (txState.status === TransactionStatus.Pending) {
        return intl.formatMessage({
          id: "transaction.waiting.confirmation",
          defaultMessage: "Waiting confirmation"
        });
      } else if (txState.status === TransactionStatus.Confirmed) {
        return intl.formatMessage({
          id: "transaction.confirmed",
          defaultMessage: "Transaction confirmed"
        });
      } else if (txState.status === TransactionStatus.Failed) {
        return intl.formatMessage({
          id: "transaction.failed",
          defaultMessage: "Transaction Failed"
        });
      }
    } else {
      return intl.formatMessage({
        id: "transaction.confirm.transaction",
        defaultMessage: "Confirm transaction"
      });
    }
  }, [txState, intl]);

  const isTransactionFailed = txState?.status === TransactionStatus.Failed;
  const isTransactionConfirmed =
    txState?.status === TransactionStatus.Confirmed;

  const renderMessage = () => {
    if (isTransactionConfirmed) {
      return intl.formatMessage({
        id: "your.transaction.has.been.confirmed",
        defaultMessage: "Your transaction has been confirmed",
        description: "Your transaction has been confirmed"
      });
    } else if (isTransactionFailed) {
      return intl.formatMessage({
        id: "confirm.the.transaction.on.your.wallet",
        defaultMessage: "Please, confirm the transaction on your wallet",
        description: "Transaction dialog message before transaction be confirmed in the wallet"
      });
    } else if (hash === undefined) {
      return intl.formatMessage({
        id: "confirm.the.transaction.on.your.wallet",
        defaultMessage: "Please, confirm the transaction on your wallet",
        description: "Transaction dialog message before transaction be confirmed in the wallet"
      });
    } else {
      return intl.formatMessage({
        id: "please.wait.for.the.block.confirmation",
        defaultMessage: "Wait for the block confirmation",
        description: "Transaction dialog message after transaction confirmation in the wallet"
      });
    }
  };

  const renderContent = () => {
    if (error !== undefined) {
      return (
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <CloseCircle color="error" fontSize="large" />
          <Box>
            <Typography align="center" variant="h5">
              {intl.formatMessage({ id: "error", defaultMessage: "Error" })}
            </Typography>
            <Typography align="center" variant="body1" color="textSecondary">
              {error?.message}
            </Typography>
          </Box>
          {hash !== undefined && (
            <Button color="primary">
              {intl.formatMessage({
                id: "view.transaction",
                defaultMessage: "View Transaction",
                description: "View transaction"
              })}
            </Button>
          )}
        </Stack>
      );
    } else {
      return (
        <Stack spacing={2} justifyContent="center" alignItems="center">
          {renderTransactionState()}
          <Box>
            <Typography align="center" variant="h5">
              {renderTitle()}
            </Typography>
            <Typography align="center" variant="body1" color="textSecondary">
              {renderMessage()}
            </Typography>
          </Box>
          {hash === undefined && metadata !== undefined && type !== undefined && (
            <Typography align="center" variant="body2">
              <TransactionTitle metadata={metadata} type={type} />
            </Typography>
          )}

          {hash !== undefined && (
            <>
              {txState !== undefined && (
                <Typography align="center" variant="body2">
                  <TransactionTitle
                    metadata={txState.metadata}
                    type={txState.type}
                  />
                </Typography>
              )}
              <Button
                color="primary"
                href={`${getBlockExplorerUrl(txState?.chainId)}/tx/${hash}`}
                target="_blank"
              >
                {intl.formatMessage({
                  id: "view.transaction",
                  defaultMessage: "View Transaction",
                  description: "View transaction"
                })}
              </Button>
            </>
          )}
        </Stack>
      );
    }
  };

  return (
    <Dialog {...dialogProps} onClose={handleClose}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 2,
          alignItems: 'center',
          alignContent: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          alignContent="center"
        >
          <ReceiptText />
          <Typography variant="inherit">
            {intl.formatMessage({
              id: "transaction",
              defaultMessage: "Transaction",
              description: "Transaction dialog title"
            })}
          </Typography>
        </Stack>
        {onClose && (
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <Divider />
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  );
}

export default TransactionDialog;
