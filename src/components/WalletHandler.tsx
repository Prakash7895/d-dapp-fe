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
import Link from 'next/link';

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
  const targetWalletAddress = userInfo?.selectedAddress;

  const [connected, setConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState('');
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

  const checkWalletStatus = useCallback(async () => {
    try {
      const accounts: string[] = await detectConnection();

      if (accounts.length) {
        setConnected(true);
        const connectedAddress = accounts[0];
        setConnectedAddress(connectedAddress);

        setConnectedToValidAddress(connectedAddress === targetWalletAddress);
        if (connectedAddress === targetWalletAddress) {
          getUpdatedProfileNft();
        } else if (!userInfo?.linkedAddresses?.includes(connectedAddress)) {
          setConfirmDialog({
            isOpen: true,
            newAddress: connectedAddress,
          });
        }
      }
    } catch (err: unknown) {
      console.log(err);
      toast.error((err as Error)?.message || 'Failed to detect connection');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userInfo,
    setConnected,
    setConnectedAddress,
    setConnectedToValidAddress,
    setConfirmDialog,
  ]);

  useEffect(() => {
    checkWalletStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetWalletAddress]);

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
        setConnectedAddress(newAddress);

        if (
          userInfo?.email &&
          !userInfo.linkedAddresses?.includes(newAddress)
        ) {
          setConfirmDialog({
            isOpen: targetWalletAddress !== newAddress,
            newAddress,
          });
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
      sessionStorage.setItem('savedWalletAddress', confirmDialog.newAddress!);
      const wallet = await connectWallet();
      setUserInfo((u) => ({ ...u!, selectedAddress: wallet.address }));

      const updatedUserInfo = await updateWalletAddress(+userInfo!.id, {
        selectedAddress: confirmDialog.newAddress,
      });
      setUserInfo(updatedUserInfo!.data!);

      toast.info(
        `Connected to new wallet: ${confirmDialog.newAddress.substring(
          0,
          6
        )}...${confirmDialog.newAddress.substring(38)}`
      );

      await getUpdatedProfileNft();
      await getCurrUsersTokenIds();

      setConfirmDialog({ isOpen: false, newAddress: '' });
      setShowAlert(false);
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
      return !userInfo?.email ? (
        `Please connect with wallet address ${targetWalletAddress}, or`
      ) : userInfo.linkedAddresses?.includes(connectedAddress) ? (
        <>
          <span className='block'>
            Your wallet is active on {connectedAddress.substring(0, 6)}...
            {connectedAddress.substring(38)}, but your profile has{' '}
            {targetWalletAddress?.substring(0, 6)}...
            {targetWalletAddress?.substring(38)} as active address.
          </span>
          <span className='block'>
            Either switch the wallet address to{' '}
            {targetWalletAddress?.substring(0, 6)}...
            {targetWalletAddress?.substring(38)} or update your active address{' '}
            {connectedAddress.substring(0, 6)}...
            {connectedAddress.substring(38)} in{' '}
            <Link
              href='/profile/wallet'
              className='font-medium underline hover:text-yellow-900'
            >
              profile
            </Link>
            .
          </span>
        </>
      ) : (
        'Please connect with one of your linked wallet addresses or add this address to your profile, or if already added switch to this new address in your profile'
      );
    }
    return '';
  };

  const showProfileLink = !userInfo?.email;

  const value = useMemo(
    () => ({
      connected,
      connectedToValidAddress,
      setShowAlert,
      checkWalletStatus,
    }),
    [connected, connectedToValidAddress, setShowAlert, checkWalletStatus]
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
