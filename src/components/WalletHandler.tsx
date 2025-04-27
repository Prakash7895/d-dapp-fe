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
import { detectConnection, onAccountChange, onChainChange } from '@/contract';
import WalletAlert from './WalletAlert';
import {
  checkConnectedWalletAddress,
  saveConnectedWalletAddress,
} from '@/apiCalls';

const Context = createContext<{
  connected: boolean;
  connectedToValidAddress: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
  checkWalletStatus: () => Promise<void>;
}>({
  connected: false,
  connectedToValidAddress: false,
  setShowAlert: () => {},
  checkWalletStatus() {
    return new Promise((r) => r);
  },
});

const WalletHandler: FC<{ children: ReactNode }> = ({ children }) => {
  const { userInfo, getUpdatedProfileNft, setUserInfo, getCurrUsersTokenIds } =
    useStateContext();
  const targetWalletAddress = userInfo?.walletAddress?.toLowerCase();

  const [connected, setConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState('');
  const [connectedToValidAddress, setConnectedToValidAddress] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isCheckingAddress, setIsCheckingAddress] = useState(false);
  const [newAddressError, setNewAddressError] = useState<string | undefined>();
  const [canConnectToCurrAddress, setCanConnectToCurrAddress] = useState(false);

  const checkWalletStatus = useCallback(async () => {
    try {
      const accounts: string[] = await detectConnection();

      if (accounts.length) {
        setConnected(true);
        const activeAddress = accounts[0].toLowerCase();
        setConnectedAddress(activeAddress);

        if (targetWalletAddress) {
          setConnectedToValidAddress(activeAddress === targetWalletAddress);
          if (activeAddress === targetWalletAddress) {
            getUpdatedProfileNft();
          }
        }
      }
    } catch (err: unknown) {
      console.log(err);
      toast.error((err as Error)?.message || 'Failed to detect connection');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo, setConnected, setConnectedAddress, setConnectedToValidAddress]);

  useEffect(() => {
    checkWalletStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetWalletAddress]);

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
  }, [connectedAddress, userInfo]);

  useEffect(() => {
    if (!connected || (connected && !connectedToValidAddress)) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [connected, connectedToValidAddress]);

  const handleAccountChange = useCallback(
    async (accounts: string[]) => {
      console.log('accounts:', accounts);

      if (accounts.length === 0) {
        setConnected(false);
        setConnectedToValidAddress(false);
        toast.info('Wallet disconnected');
      } else {
        const newAddress = accounts[0].toLowerCase();

        setConnected(true);
        setConnectedAddress(newAddress);
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
    setSaving(true);
    setNewAddressError(undefined);

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
      console.error('Error checking address:', error);
      setNewAddressError('Failed to verify wallet address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    // Not connected state
    if (!connected) {
      return 'Wallet Connection Required';
    }

    // Checking state
    if (isCheckingAddress) {
      return 'Checking Wallet...';
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
    // Not connected state
    if (!connected) {
      return 'Please connect your wallet to continue using the app.';
    }

    // Checking state
    if (isCheckingAddress) {
      return 'Please wait while we verify your wallet address...';
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
      if (canConnectToCurrAddress && !targetWalletAddress) {
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
      connected,
      connectedToValidAddress,
      setShowAlert,
      checkWalletStatus,
    }),
    [connected, connectedToValidAddress, setShowAlert, checkWalletStatus]
  );

  const showEmailRecommendation = useMemo(() => {
    return !userInfo?.email && connected && connectedToValidAddress;
  }, [userInfo?.email, connected, connectedToValidAddress]);

  return (
    <Context.Provider value={value}>
      {(showAlert || showEmailRecommendation) && (
        <WalletAlert
          title={getTitle()}
          message={getMessage()}
          showConnectBtn={!connected}
          showSaveBtn={
            !targetWalletAddress &&
            connected &&
            !connectedToValidAddress &&
            canConnectToCurrAddress
          }
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
