import React, { FC } from 'react';
import Button, { ButtonProps } from './Button';
import AnimatedTooltip from './AnimatedTooltip';
import { useEthereum } from './EthereumProvider';
import { JsonRpcSigner } from 'ethers';

interface TransactionBtnProps extends Omit<ButtonProps, 'onClick'> {
  onClickWithSigner?: (signer: JsonRpcSigner) => void;
}

const TransactionBtn: FC<TransactionBtnProps> = ({
  buttonType,
  children,
  className,
  disabled,
  isLoading,
  label,
  loadingLabel,
  type,
  onClickWithSigner,
}) => {
  const { isConnected, isConnecting, isWalletPresent, connect, signer } =
    useEthereum();

  // Determine button state and tooltip content
  let tooltipContent = '';
  let buttonLabel = label || 'Connect Wallet';
  let buttonLoadingLabel = loadingLabel || 'Processing...';
  let isButtonDisabled = disabled || isLoading;

  if (!isWalletPresent) {
    tooltipContent =
      'Wallet not installed. Please install MetaMask or another Ethereum wallet to proceed.';
    buttonLabel = 'Wallet Not Installed';
    isButtonDisabled = true;
  } else if (!isConnected) {
    tooltipContent =
      'Wallet not connected. Please connect your wallet to proceed.';
    buttonLabel = isConnecting ? 'Connecting...' : buttonLabel;
    buttonLoadingLabel = 'Connecting...';
    isButtonDisabled = isConnecting;
  } else if (isLoading) {
    tooltipContent = 'Transaction is being processed. Please wait.';
    buttonLabel = buttonLoadingLabel;
    isButtonDisabled = true;
  } else {
    tooltipContent = 'Click to proceed with the transaction.';
    isButtonDisabled = disabled;
  }

  const handleClick = () => {
    if (!isConnected || !signer) {
      connect().then((_signer) => {
        if (_signer) {
          onClickWithSigner?.(_signer);
        }
      });
    }
    if (signer) {
      onClickWithSigner?.(signer);
    }
  };

  return (
    <AnimatedTooltip tooltipContent={tooltipContent} className='w-full'>
      <Button
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
        label={buttonLabel}
        isLoading={isLoading || isConnecting}
        disabled={isButtonDisabled}
        loadingLabel={buttonLoadingLabel}
        type={type}
        className={className}
        buttonType={buttonType}
      >
        {children}
      </Button>
    </AnimatedTooltip>
  );
};

export default TransactionBtn;
