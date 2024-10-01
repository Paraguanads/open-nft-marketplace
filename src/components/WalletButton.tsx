import { Logout } from '@mui/icons-material';
import {
  Avatar,
  ButtonBase,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useAtomValue } from 'jotai';
import { useCallback, useState } from 'react';
import { isBalancesVisibleAtom } from '../state/atoms';
import { getWalletIcon, truncateAddress } from '../utils/blockchain';
import { useIntl } from 'react-intl';
import { metaMask } from '../connectors/metamask';
import { handleWalletConnectDisconnect } from '../connectors/walletConnect';

interface Props {
  align?: 'center' | 'left';
}

export function WalletButton(props: Props) {
  const { align } = props;
  const { connector, account, ENSName, chainId } = useWeb3React();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isBalancesVisible = useAtomValue(isBalancesVisibleAtom);

  const justifyContent = align === 'left' ? 'flex-start' : 'center';

  const handleLogoutWallet = useCallback(async () => {
    if (connector) {
      if (typeof connector.deactivate === 'function') {
        await connector.deactivate();
      } else if (typeof connector.resetState === 'function') {
        await connector.resetState();
      }
    }

    if (connector === metaMask) {
      await metaMask.resetState();
    }

    handleClose();


  }, [connector]);

  const intl = useIntl();

  return (
    <>
      <ButtonBase
        id="wallet-button"
        sx={(theme) => ({
          px: 2,
          py: 1,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.spacing(1),
          justifyContent,
        })}
        onClick={handleClick}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            src={getWalletIcon(connector)}
            sx={(theme) => ({
              width: theme.spacing(2),
              height: theme.spacing(2),
            })}
          />
          <Typography variant="body1">
            {isBalancesVisible
              ? ENSName || truncateAddress(account)
              : '**********'}
          </Typography>
        </Stack>
      </ButtonBase>
      <Menu
        id="wallet-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'wallet-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleLogoutWallet}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          {intl.formatMessage({ id: "logout.wallet", defaultMessage: "Logout wallet" })}
        </MenuItem>
      </Menu>
    </>
  );
}
