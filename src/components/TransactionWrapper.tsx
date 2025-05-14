import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useEthereum } from './EthereumProvider';
import { useStateContext } from './StateProvider';
import AnimatedTooltip from './AnimatedTooltip';

interface TransactionWrapperProps {
  children?: ReactNode;
  content?: (disabled: boolean) => ReactNode;
  tooltipContent?: {
    loggedInUserHasNoWallet?: ReactNode;
    walletNotConnected?: ReactNode;
    walletAddressMismatch?: ReactNode;
    default?: ReactNode;
  };
  disabled?: boolean;
  position?: 'top' | 'left' | 'right';
}

export const CHAIN_ID = 80002;

const TransactionWrapper: FC<TransactionWrapperProps> = ({
  children,
  tooltipContent,
  content,
  disabled,
  position = 'top',
}) => {
  const { userInfo } = useStateContext();
  const targetWalletAddress = userInfo?.walletAddress?.toLowerCase();
  const { signer, provider } = useEthereum();
  const [connectedAddress, setConnectedAddress] = useState('');
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    signer?.getAddress().then((address) => {
      setConnectedAddress(address.toLowerCase());
    });

    provider?.getNetwork().then((network) => {
      const _chainId = Number(network.chainId);

      setChainId(_chainId);
    });
  }, [signer]);

  let tooltipMessage: ReactNode = '';
  let isDisabled = false;
  if (!connectedAddress) {
    tooltipMessage =
      tooltipContent?.walletNotConnected ??
      'Wallet not connected. Please connect your wallet to proceed.';
    isDisabled = true;
  } else if (!targetWalletAddress) {
    tooltipMessage =
      tooltipContent?.loggedInUserHasNoWallet ??
      'No wallet address linked. Please link a wallet for future transactions.';
    isDisabled = true;
  } else if (targetWalletAddress !== connectedAddress) {
    tooltipMessage =
      tooltipContent?.walletAddressMismatch ??
      `Please connect with the wallet address linked to your profile: ${targetWalletAddress?.substring(
        0,
        6
      )}...${targetWalletAddress?.substring(38)}.`;
    isDisabled = true;
  } else if (chainId !== CHAIN_ID) {
    tooltipMessage =
      tooltipContent?.default ??
      'You are connected to the wrong network. Please switch to the Amoy network to proceed.';
    isDisabled = true;
  } else {
    tooltipMessage =
      tooltipContent?.default ?? 'Click to proceed with the transaction.';
  }

  return tooltipMessage ? (
    <AnimatedTooltip
      disabled={isDisabled || disabled}
      tooltipContent={tooltipMessage}
      className='w-full'
      position={position}
    >
      {content ? content(isDisabled) : children}
    </AnimatedTooltip>
  ) : (
    children
  );
};

export default TransactionWrapper;
