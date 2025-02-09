import { useIntl } from 'react-intl';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,

  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  DialogTitle,
} from '@mui/material';
import { useState } from 'react';
import { NETWORKS } from '../../constants/chain';
import { useSwitchNetworkMutation } from '../../hooks/blockchain';
import { isSupportedChainId } from '../../constants';
import { useWeb3React } from '@web3-react/core';
import Image from 'next/image';


interface Props {
  dialogProps: DialogProps;
}

function SwitchNetworkDialog({ dialogProps }: Props) {
  const intl = useIntl();
  const { onClose } = dialogProps;
  const { chainId } = useWeb3React();

  const [selectedChainId, setSelectedChainId] = useState<number>();

  const switchNetworkMutation = useSwitchNetworkMutation();

  const handleClose = () => {
    onClose!({}, 'backdropClick');
    setSelectedChainId(undefined);
  };

  const handleSwitchNetwork = async () => {
    if (selectedChainId !== undefined) {
      if (typeof selectedChainId === 'number') {
        await switchNetworkMutation.mutateAsync({ chainId: selectedChainId });
      } else if (typeof selectedChainId === 'string') {
        await switchNetworkMutation.mutateAsync({
          chainId: parseInt('0x' + selectedChainId, 16),
        });
      }

      handleClose();
    }
  };

  const handleSelectNetwork = (id: number) => {
    if (id === selectedChainId) {
      return setSelectedChainId(undefined);
    }

    setSelectedChainId(id);
  };

  const handleReset = () => {
    switchNetworkMutation.reset();
  };

  return (
    <Dialog {...dialogProps}>
      <DialogTitle>Seleccionar Red</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Stack spacing={2}>
          {switchNetworkMutation.isError && (
            <Alert severity="error" onClose={handleReset}>
              {switchNetworkMutation.error?.message}
            </Alert>
          )}
          <List disablePadding>
            {Object.entries(NETWORKS)
              .filter(([id, network]) => {
                const numId = parseInt(id);
                return isSupportedChainId(numId) && 
                       network && 
                       !network.testnet;
              })
              .map(([id, network]) => (
                <ListItemButton
                  key={id}
                  disabled={switchNetworkMutation.isLoading}
                  selected={chainId === parseInt(id)}
                  onClick={() => handleSelectNetwork(parseInt(id))}
                >
                  <ListItemIcon>
                    {network.imageUrl && (
                      <Image
                        src={network.imageUrl}
                        alt={network.name}
                        width={32}
                        height={32}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={network.name} />
                </ListItemButton>
              ))}
          </List>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          disabled={switchNetworkMutation.isLoading || selectedChainId === undefined}
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
export default SwitchNetworkDialog;
