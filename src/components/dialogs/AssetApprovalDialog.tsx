import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  Stack,
  Typography,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { TransactionStatus } from '../../types/blockchain';
import { getBlockExplorerUrl } from '../../utils/blockchain';

interface Props {
  hash?: string;
  status: TransactionStatus;
  dialogProps: DialogProps;
  title?: string | React.ReactNode | React.ReactNode[];
  icon?: React.ReactNode | React.ReactNode[];
}

export function AssetApprovalDialog({
  dialogProps,
  status,
  hash,
  icon,
  title,
}: Props) {
  const intl = useIntl();
  const { onClose } = dialogProps;
  const { chainId } = useWeb3React();

  return (
    <Dialog {...dialogProps}>
      <DialogContent>
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Box>
            <Typography variant="h5">
              {intl.formatMessage({
                id: "approve.asset.title",
                defaultMessage: "Approve Asset"
              })}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {intl.formatMessage({
                id: "approve.asset.description",
                defaultMessage: "to App"
              })}
            </Typography>
          </Box>
          {hash && (
            <Button
              href={`${getBlockExplorerUrl(chainId)}/tx/${hash}`}
              target="_blank"
            >
              {intl.formatMessage({
                id: "view.transaction",
                defaultMessage: "View transaction"
              })}
            </Button>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default AssetApprovalDialog;
