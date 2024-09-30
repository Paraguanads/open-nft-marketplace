import { useIntl } from 'react-intl';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Stack,
  Typography,
} from '@mui/material';
import { useSwitchNetworkMutation } from '../../hooks/blockchain';
import { getChainName } from '../../utils/blockchain';
import { AppDialogTitle } from '../AppDialogTitle';

interface Props {
  dialogProps: DialogProps;
  chainId?: number;
}

export function SwitchNetworkDialog({ dialogProps, chainId }: Props) {
  const intl = useIntl();
  const { onClose } = dialogProps;

  const switchNetworkMutation = useSwitchNetworkMutation();

  const handleClose = () => onClose!({}, 'backdropClick');

  const handleSwitchNetwork = async () => {
    if (chainId !== undefined) {
      await switchNetworkMutation.mutateAsync({ chainId });
      handleClose();
    }
  };

  const handleReset = () => {
    switchNetworkMutation.reset();
  };

  return (
    <Dialog {...dialogProps}>
      <AppDialogTitle
        title={intl.formatMessage({
          id: "switch.network",
          defaultMessage: "Switch network",
          description: "Switch network dialog title"
        })}
        onClose={handleClose}
      />
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body1">
            {intl.formatMessage(
              {
                id: "switch.network.content.text",
                defaultMessage: "Please, switch to {chainName} network to create listings or offers for this asset",
                description: "Switch network dialog content text"
              },
              { chainName: <b>{getChainName(chainId)}</b> }
            )}
          </Typography>
          {switchNetworkMutation.isError && (
            <Alert severity="error" onClose={handleReset}>
              {switchNetworkMutation.error?.message}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          disabled={switchNetworkMutation.isLoading}
          startIcon={
            switchNetworkMutation.isLoading ? (
              <CircularProgress color="inherit" size="1rem" />
            ) : undefined
          }
          onClick={handleSwitchNetwork}
        >
          {intl.formatMessage({
            id: "switch",
            defaultMessage: "Switch",
            description: "switch"
          })}
        </Button>
        <Button
          disabled={switchNetworkMutation.isLoading}
          onClick={handleClose}
        >
          {intl.formatMessage({
            id: "cancel",
            defaultMessage: "Cancel",
            description: "Cancel"
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
