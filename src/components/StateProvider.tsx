'use client';
import {
  connectWallet,
  detectConnection,
  getActiveProfileNft,
  getMintFee,
  getUserTokenIds,
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
import { SessionProvider } from 'next-auth/react';

const Context = createContext<{
  userAddress: string;
  setUserAddress: React.Dispatch<React.SetStateAction<string>>;
  activeProfilePhoto: string;
  setActiveProfilePhoto: React.Dispatch<React.SetStateAction<string>>;
  tokedIds: number[];
  setTokedIds: React.Dispatch<React.SetStateAction<number[]>>;
  getCurrUsersTokenIds: () => void;
  getUpdatedProfileNft: () => void;
}>({
  userAddress: '',
  setUserAddress: () => {},
  activeProfilePhoto: '',
  setActiveProfilePhoto: () => {},
  tokedIds: [],
  setTokedIds: () => {},
  getCurrUsersTokenIds: () => {},
  getUpdatedProfileNft: () => {},
});

const StateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [userAddress, setUserAddress] = useState('');
  const [activeProfilePhoto, setActiveProfilePhoto] = useState('');
  const [tokedIds, setTokedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeProvider = async () => {
      try {
        setLoading(true);
        const accounts = await detectConnection();

        console.log('accounts', accounts);

        if (accounts.length) {
          const wallet = await connectWallet();
          console.log('wallet', wallet);
          setUserAddress(wallet.address || '');

          const mintFee = await getMintFee();

          console.log('mintFee:', mintFee);

          getActiveProfileNft().then((res) => {
            if (res) {
              setActiveProfilePhoto(res);
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        console.log(err);
        toast.error(err?.message || 'Failed to detect connection');
      }
    };

    initializeProvider();
  }, []);

  const getCurrUsersTokenIds = useCallback(() => {
    getUserTokenIds().then((res) => {
      if (res) {
        setTokedIds(res);
      }
    });
  }, []);

  const getUpdatedProfileNft = useCallback(() => {
    getActiveProfileNft().then((p) => {
      setActiveProfilePhoto(p);
    });
  }, []);

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
    ]
  );

  return (
    <Context.Provider value={value}>
      <ToastContainer />
      {loading ? (
        <ScreenLoader />
      ) : (
        <SessionProvider>
          <MainLayout>{children}</MainLayout>
        </SessionProvider>
      )}
    </Context.Provider>
  );
};

export default StateProvider;

export const useStateContext = () => useContext(Context);
