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
import {
  connectWallet,
  detectConnection,
  onAccountChange,
  onChainChange,
} from '@/contract';
import WalletAlert from './WalletAlert';
import { checkAddress, updateWalletAddress } from '@/apiCalls';
import WalletConfirmDialog from './WalletConfirmDialog';

const Context = createContext<{
  connected: boolean;
  connectedToValidAddress: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  connected: false,
  connectedToValidAddress: false,
  setShowAlert: () => {},
});

const WalletHandler: FC<{ children: ReactNode }> = ({ children }) => {
  const { userInfo, getUpdatedProfileNft, setUserInfo, getCurrUsersTokenIds } =
    useStateContext();
  const targetWalletAddress = userInfo?.selectedAddress;

  const [connected, setConnected] = useState(false);
  const [connectedToValidAddress, setConnectedToValidAddress] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    newAddress: string;
  }>({
    isOpen: false,
    newAddress: '',
  });
  const [isCheckingAddress, setIsCheckingAddress] = useState(false);
  const [newAddressError, setNewAddressError] = useState<string | undefined>();

  useEffect(() => {
    const initializeProvider = async () => {
      try {
        const accounts: string[] = await detectConnection();

        console.log('accounts', accounts);

        if (accounts.length) {
          setConnected(true);
          const connectedAddress = accounts[0];

          if (connectedAddress === targetWalletAddress) {
            setConnectedToValidAddress(true);
          }
        }
      } catch (err: any) {
        console.log(err);
        toast.error(err?.message || 'Failed to detect connection');
      }
    };

    initializeProvider();
  }, []);

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
        const isValidAddress = targetWalletAddress === newAddress;
        setConnectedToValidAddress(isValidAddress);

        if (userInfo?.email) {
          setConfirmDialog({
            isOpen: targetWalletAddress !== newAddress,
            newAddress,
          });
        }
      }
    },
    [userInfo]
  );

  const handleChainChange = useCallback((chainId: string) => {
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
    setIsCheckingAddress(true);
    setNewAddressError(undefined);

    try {
      const data = await checkAddress({
        selectedAddress: confirmDialog.newAddress,
      });

      if (data.status === 'success' && data.data?.isTaken) {
        setNewAddressError(
          'This wallet address is already linked to another account.'
        );
        setIsCheckingAddress(false);
        return;
      }

      const wallet = await connectWallet();
      setUserInfo((u) => ({ ...u!, selectedAddress: wallet.address }));

      const updatedUserInfo = await updateWalletAddress(+userInfo?.id!, {
        selectedAddress: confirmDialog.newAddress,
      });
      setUserInfo(updatedUserInfo);

      toast.info(
        `Connected to new wallet: ${confirmDialog.newAddress.substring(
          0,
          6
        )}...${confirmDialog.newAddress.substring(38)}`
      );

      await getUpdatedProfileNft();
      await getCurrUsersTokenIds();

      setConfirmDialog({ isOpen: false, newAddress: '' });
    } catch (error) {
      console.error('Error checking address:', error);
      setNewAddressError('Failed to verify wallet address. Please try again.');
    } finally {
      setIsCheckingAddress(false);
    }
  };

  const handleCancelNewAddress = () => {
    setConfirmDialog({ isOpen: false, newAddress: '' });
    setNewAddressError(undefined);
  };

  const getTitle = () => {
    if (!connected) {
      return 'Wallet Connection Required';
    }
    if (!connectedToValidAddress) {
      return !userInfo?.email
        ? 'Original Wallet Required'
        : 'Invalid Wallet Address';
    }
    return '';
  };

  const getMessage = () => {
    if (!connected) {
      return 'Please connect your wallet to access the app.';
    }
    if (!connectedToValidAddress) {
      return !userInfo?.email
        ? `Please connect with wallet address ${targetWalletAddress}, or`
        : 'Please connect with one of your linked wallet addresses or add this address to your profile, or if already added switch to this new address in your profile';
    }
    return '';
  };

  const showProfileLink = !userInfo?.email;

  const value = useMemo(
    () => ({ connected, connectedToValidAddress, setShowAlert }),
    [connected, connectedToValidAddress, setShowAlert]
  );

  return (
    <Context.Provider value={value}>
      {showAlert && (
        <WalletAlert
          title={getTitle()}
          message={getMessage()}
          showProfileLink={showProfileLink}
        />
      )}
      {confirmDialog.isOpen && (
        <WalletConfirmDialog
          newAddress={confirmDialog.newAddress}
          onConfirm={handleConfirmNewAddress}
          onCancel={handleCancelNewAddress}
          isChecking={isCheckingAddress}
          error={newAddressError}
        />
      )}
      {children}
    </Context.Provider>
  );
};

export default WalletHandler;

export const useWalletContext = () => useContext(Context);
