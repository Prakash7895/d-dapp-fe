'use client';
import {
  connectWallet,
  detectConnection,
  getActiveProfileNft,
  getMintFee,
  getUserTokenIds,
  onAccountChange,
  onChainChange,
} from '@/contract';
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
import { toast, ToastContainer } from 'react-toastify';
import ScreenLoader from './ScreenLoader';
import MainLayout from './MainLayout';
import { User } from '@/types/user';
import { getUserInfo } from '@/apiCalls';

const Context = createContext<{
  userAddress: string;
  setUserAddress: React.Dispatch<React.SetStateAction<string>>;
  activeProfilePhoto: string;
  setActiveProfilePhoto: React.Dispatch<React.SetStateAction<string>>;
  tokedIds: number[];
  setTokedIds: React.Dispatch<React.SetStateAction<number[]>>;
  getCurrUsersTokenIds: () => void;
  getUpdatedProfileNft: () => void;
  userInfo: User | null;
}>({
  userAddress: '',
  setUserAddress: () => {},
  activeProfilePhoto: '',
  setActiveProfilePhoto: () => {},
  tokedIds: [],
  setTokedIds: () => {},
  getCurrUsersTokenIds: () => {},
  getUpdatedProfileNft: () => {},
  userInfo: null,
});

const StateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [userAddress, setUserAddress] = useState('');
  const [activeProfilePhoto, setActiveProfilePhoto] = useState('');
  const [tokedIds, setTokedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    const initializeProvider = async () => {
      try {
        setLoading(true);
        const info = await getUserInfo();
        setUserInfo(info);

        const savedWalletAddresses = info?.linkedAddresses;

        const accounts = await detectConnection();

        console.log('accounts', accounts);

        const connectedAddress = accounts[0].toLowerCase();

        const linkedWalletAddresses = accounts?.filter((a: string) =>
          savedWalletAddresses?.includes(a)
        );

        if (linkedWalletAddresses?.includes(connectedAddress)) {
          const wallet = await connectWallet();
          console.log('wallet', wallet);
          setUserAddress(wallet.address || '');

          getUpdatedProfileNft().then(() => {
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setLoading(false);
        console.log(err);
        toast.error(err?.message || 'Failed to detect connection');
      }
    };

    initializeProvider();
  }, []);

  // Function to handle account changes
  const handleAccountChange = useCallback(async (accounts: string[]) => {
    console.log('accounts:', accounts);
    if (accounts.length === 0) {
      // User disconnected their wallet
      setUserAddress('');
      setActiveProfilePhoto('');
      setTokedIds([]);
      setUserInfo(null);
      toast.info('Wallet disconnected');
    } else {
      // User switched accounts
      const newAddress = accounts[0];
      setUserAddress(newAddress);
      toast.info(
        `Switched to account: ${newAddress.substring(
          0,
          6
        )}...${newAddress.substring(38)}`
      );

      await getUpdatedProfileNft();
      getUserTokenIds().then((res) => {
        if (res) {
          setTokedIds(res);
        }
      });
    }
  }, []);

  // Function to handle chain changes
  const handleChainChange = useCallback((chainId: string) => {
    // Reload the page when chain changes to ensure everything is in sync
    window.location.reload();
  }, []);

  // Set up account change listener
  useEffect(() => {
    const removeAccountListener = onAccountChange(handleAccountChange);
    const removeChainListener = onChainChange(handleChainChange);

    // Clean up listeners when component unmounts
    return () => {
      removeAccountListener();
      removeChainListener();
    };
  }, [handleAccountChange, handleChainChange]);

  const getCurrUsersTokenIds = useCallback(() => {
    getUserTokenIds().then((res) => {
      if (res) {
        setTokedIds(res);
      }
    });
  }, []);

  const getUpdatedProfileNft = useCallback(
    () =>
      getActiveProfileNft().then((p) => {
        if (p) {
          setActiveProfilePhoto(p);
        }
      }),
    []
  );

  const value = useMemo(
    () => ({
      userAddress,
      setUserAddress,
      activeProfilePhoto,
      setActiveProfilePhoto,
      tokedIds,
      setTokedIds,
      getCurrUsersTokenIds,
      getUpdatedProfileNft,
      userInfo,
    }),
    [
      userAddress,
      setUserAddress,
      activeProfilePhoto,
      setActiveProfilePhoto,
      tokedIds,
      setTokedIds,
      getCurrUsersTokenIds,
      getUpdatedProfileNft,
      userInfo,
    ]
  );

  return (
    <Context.Provider value={value}>
      <ToastContainer />
      {loading ? <ScreenLoader /> : <MainLayout>{children}</MainLayout>}
    </Context.Provider>
  );
};

export default StateProvider;

export const useStateContext = () => useContext(Context);
