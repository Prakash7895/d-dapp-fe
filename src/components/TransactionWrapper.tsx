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
}

const TransactionWrapper: FC<TransactionWrapperProps> = ({
  children,
  tooltipContent,
  content,
  disabled,
}) => {
  const { userInfo } = useStateContext();
  const targetWalletAddress = userInfo?.walletAddress?.toLowerCase();
  const { signer } = useEthereum();
  const [connectedAddress, setConnectedAddress] = useState('');
  console.log('connectedAddress', connectedAddress);

  useEffect(() => {
    signer?.getAddress().then((address) => {
      setConnectedAddress(address.toLowerCase());
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
  } else {
    tooltipMessage =
      tooltipContent?.default ?? 'Click to proceed with the transaction.';
  }

  return tooltipMessage ? (
    <AnimatedTooltip
      disabled={isDisabled || disabled}
      tooltipContent={tooltipMessage}
      className='w-full'
    >
      {content ? content(isDisabled) : children}
    </AnimatedTooltip>
  ) : (
    children
  );
};

export default TransactionWrapper;
