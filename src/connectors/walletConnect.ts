import { initializeConnector } from '@web3-react/core';
import { WalletConnect } from '@web3-react/walletconnect';
import { NETWORKS } from '../constants/chain';

interface Network {
  providerRpcUrl: string;
}

const rpcs: { [key: number]: string } = {}

for (const [key, network] of Object.entries(NETWORKS)) {
  if ((network as Network).providerRpcUrl) {
    rpcs[Number(key)] = (network as Network).providerRpcUrl;
  }
}

export const [walletConnect, hooks] = initializeConnector<WalletConnect>((actions) => 
  new WalletConnect({
    actions,
    options: {
      rpc: rpcs,
      qrcode: true,
      qrcodeModalOptions: { mobileLinks: ['rainbow', 'metamask', 'argent', 'trust'] },
    },
    onError: (error: Error) => {
      if (error.message === 'User closed modal') {
        console.log('User closed modal without connecting');
        actions.resetState();
      } else {
        console.error('WalletConnect Error:', error);
      }
    },
  })
);

export const handleWalletConnectDisconnect = () => {
  walletConnect.deactivate();
  walletConnect.resetState();
};
