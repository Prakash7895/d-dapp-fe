'use client';

import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useStateContext } from './StateProvider';
import { toast } from 'react-toastify';
import { onAccountChange, onChainChange } from '@/contract';
import WalletAlert from './WalletAlert';
import {
  checkConnectedWalletAddress,
  saveConnectedWalletAddress,
} from '@/apiCalls';
import { useEthereum } from './EthereumProvider';
import { usePathname } from 'next/navigation';
import { CHAIN_ID } from './TransactionWrapper';

const Context = createContext<{
  connectedToValidAddress: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  connectedToValidAddress: false,
  setShowAlert: () => {},
});

const WalletHandler: FC<{ children: ReactNode }> = ({ children }) => {
  const { userInfo, getUpdatedProfileNft, setUserInfo, getCurrUsersTokenIds } =
    useStateContext();
  const targetWalletAddress = userInfo?.walletAddress?.toLowerCase();

  const [connectedToValidAddress, setConnectedToValidAddress] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isCheckingAddress, setIsCheckingAddress] = useState(false);
  const [canConnectToCurrAddress, setCanConnectToCurrAddress] = useState(false);
  const { isConnected, connectedAddress, isWalletPresent, chainId } =
    useEthereum();
  const pathName = usePathname();

  useEffect(() => {
    if (connectedAddress && !targetWalletAddress) {
      setIsCheckingAddress(true);
      checkConnectedWalletAddress(connectedAddress).then((res) => {
        setIsCheckingAddress(false);
        if (res.status === 'success') {
          setCanConnectToCurrAddress(true);
        } else {
          setCanConnectToCurrAddress(false);
        }
      });
    }

    if (connectedAddress?.toLowerCase() === targetWalletAddress) {
      setConnectedToValidAddress(true);
    }
  }, [connectedAddress, userInfo]);

  useEffect(() => {
    if (!isConnected || (isConnected && !connectedToValidAddress)) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [isConnected, connectedToValidAddress]);

  const handleAccountChange = useCallback(
    async (accounts: string[]) => {
      if (accounts.length === 0) {
        setConnectedToValidAddress(false);
        toast.info('Wallet disconnected');
      } else {
        const newAddress = accounts[0].toLowerCase();

        if (targetWalletAddress) {
          const isValidAddress = targetWalletAddress === newAddress;
          setConnectedToValidAddress(isValidAddress);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userInfo]
  );

  const handleChainChange = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    const removeAccountListener = onAccountChange(handleAccountChange);
    const removeChainListener = onChainChange(handleChainChange);

    return () => {
      removeAccountListener();
      removeChainListener();
    };
  }, [handleAccountChange, handleChainChange]);

  const handleConfirmNewAddress = async () => {
    if (!connectedAddress) {
      return;
    }
    setSaving(true);

    try {
      const res = await saveConnectedWalletAddress(connectedAddress);
      if (res.status === 'success') {
        sessionStorage.setItem(
          'savedWalletAddress',
          JSON.stringify(connectedAddress ?? null)
        );
        toast.info(
          `Connected to wallet: ${connectedAddress.substring(
            0,
            6
          )}...${connectedAddress.substring(38)}`
        );
        setUserInfo((u) => ({
          ...u!,
          walletAddress: connectedAddress,
        }));

        await getUpdatedProfileNft();
        await getCurrUsersTokenIds();

        setShowAlert(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log('Error checking address:', error);
    } finally {
      setSaving(false);
    }
  };

  const isCorrectChain = chainId === CHAIN_ID;

  const getTitle = () => {
    // Not connected state
    if (!isConnected || !isWalletPresent) {
      return 'Wallet Connection Required';
    }

    if (!isCorrectChain) {
      return 'Wrong Network';
    }

    // Checking state
    if (isCheckingAddress) {
      return 'Checking Wallet...';
    }

    if (!targetWalletAddress) {
      return 'Wallet Not Linked';
    }

    // Not connected to valid address
    if (!connectedToValidAddress) {
      if (!userInfo?.email) {
        return 'Original Wallet Required';
      }
      if (targetWalletAddress) {
        return 'Wrong Wallet Connected';
      }
      return 'Wallet Not Linked';
    }

    // Connected but invalid state
    if (
      !canConnectToCurrAddress &&
      targetWalletAddress &&
      connectedAddress !== targetWalletAddress
    ) {
      return 'Invalid Wallet Address';
    }

    // Saving state
    if (saving) {
      return 'Saving Wallet...';
    }

    return '';
  };

  const getMessage = () => {
    // Wallet not present
    if (!isWalletPresent) {
      return 'No wallet detected. Please install a wallet like MetaMask or use a supported browser to connect your wallet.';
    }

    if (!isCorrectChain) {
      return 'You are connected to the wrong network. Please switch to the Amoy network to proceed.';
    }

    // Not connected state
    if (!isConnected) {
      return 'Please connect your wallet to continue using the app.';
    }

    // Checking state
    if (isCheckingAddress) {
      return 'Please wait while we verify your wallet address...';
    }

    if (!targetWalletAddress) {
      let addText = '';
      if (connectedAddress) {
        addText = `\nWould you like to link ${connectedAddress.substring(
          0,
          6
        )}...${connectedAddress.substring(
          38
        )} wallet address to your profile? Once linked, you cannot change it.`;
      }
      return `Please link your wallet address to your profile for future transactions.${addText}`;
    }

    // Not connected to valid address
    if (!connectedToValidAddress) {
      if (!userInfo?.email) {
        return `Please connect with your original wallet address: ${targetWalletAddress?.substring(
          0,
          6
        )}...${targetWalletAddress?.substring(38)}`;
      }
      if (targetWalletAddress) {
        return `Please connect with the wallet address linked to your profile: ${targetWalletAddress.substring(
          0,
          6
        )}...${targetWalletAddress.substring(38)}`;
      }
      if (canConnectToCurrAddress && !targetWalletAddress && connectedAddress) {
        return `Would you like to link ${connectedAddress.substring(
          0,
          6
        )}...${connectedAddress.substring(38)} wallet address to your profile?`;
      }
      return 'An account is already associated with this wallet address. Please log in using the corresponding account to continue.';
    }

    // Connected but invalid state
    if (
      !canConnectToCurrAddress &&
      targetWalletAddress &&
      connectedAddress &&
      connectedAddress !== targetWalletAddress
    ) {
      return `The wallet address ${connectedAddress.substring(
        0,
        6
      )}...${connectedAddress.substring(38)} cannot be used with this account.`;
    }

    // Saving state
    if (saving) {
      return 'Please wait while we save your wallet address...';
    }

    return '';
  };

  const value = useMemo(
    () => ({
      connectedToValidAddress,
      setShowAlert,
    }),
    [connectedToValidAddress, setShowAlert]
  );

  const showEmailRecommendation = useMemo(() => {
    return !userInfo?.email && isConnected && connectedToValidAddress;
  }, [userInfo?.email, isConnected, connectedToValidAddress]);

  return (
    <Context.Provider value={value}>
      {pathName !== '/onboarding' &&
        (showAlert || showEmailRecommendation || !isCorrectChain) && (
          <WalletAlert
            title={getTitle()}
            message={getMessage()}
            showConnectBtn={!isConnected && isWalletPresent}
            showSaveBtn={!targetWalletAddress && !!connectedAddress}
            onSave={handleConfirmNewAddress}
            isLoading={isCheckingAddress}
            isSaving={saving}
            showEmailRecommendation={showEmailRecommendation}
          />
        )}
      {children}
    </Context.Provider>
  );
};

export default WalletHandler;

export const useWalletContext = () => useContext(Context);
