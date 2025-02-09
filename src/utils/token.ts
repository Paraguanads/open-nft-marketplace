import { BigNumber, ethers } from 'ethers';
import defaultConfig from '../../config/default.tokenlist.json';
import { ChainId } from '../constants/enum';

export function GET_TOKEN(address: string, chainId: number) {
  let index = defaultConfig.tokens.findIndex((t) => {
    return (
      t.address.toLowerCase() === address.toLowerCase() && t.chainId === chainId
    );
  });
  if (index === -1) {
    return;
  }

  return defaultConfig.tokens[index];
}

export function TOKEN_ICON_URL(address: string, chainId?: ChainId) {
  switch (chainId) {
    case ChainId.ETHEREUM:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/ethereum/assets/${address}/logo.png`;
    case ChainId.POLYGON:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/polygon/assets/${address}/logo.png`;
    case ChainId.AVALANCHE:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/avalanchex/assets/${address}/logo.png`;
    /* case ChainId.BINANCE:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/binance/assets/${address}/logo.png`; */
    case ChainId.FANTOM:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/fantom/assets/${address}/logo.png`;
    case ChainId.CELO:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/celo/assets/${address}/logo.png`;
    case ChainId.OPTIMISM:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/optimism/assets/${address}/logo.png`;
    case ChainId.ARBITRUM:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/arbitrum/assets/${address}/logo.png`;
    case ChainId.BASE:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/base/assets/${address}/logo.png`;
    default:
      return '';
  }
}

export function formatUnits(balance: BigNumber, decimals: number) {
  return Number(ethers.utils.formatUnits(balance, decimals)).toFixed(3);
}
