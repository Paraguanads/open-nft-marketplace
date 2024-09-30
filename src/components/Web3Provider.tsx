'use client';

import { Web3ReactProvider } from '@web3-react/core';
import { ReactNode } from 'react';
import { metaMask, hooks as metaMaskHooks } from '../connectors/metamask';
import { walletConnect, hooks as walletConnectHooks } from '../connectors/walletConnect';

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <Web3ReactProvider
      connectors={[
        [metaMask as any, metaMaskHooks],
        [walletConnect, walletConnectHooks],
      ]}
    >
      {children}
    </Web3ReactProvider>
  );
}