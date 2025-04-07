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

const Context = createContext<{
  userAddress: string;
  setUserAddress: React.Dispatch<React.SetStateAction<string>>;
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
  activeProfilePhoto: string;
  setActiveProfilePhoto: React.Dispatch<React.SetStateAction<string>>;
  tokedIds: number[];
  setTokedIds: React.Dispatch<React.SetStateAction<number[]>>;
  getCurrUsersTokenIds: () => void;
  getUpdatedProfileNft: () => void;
}>({
  userAddress: '',
  setUserAddress: () => {},
  connected: false,
  setConnected: () => {},
  activeProfilePhoto: '',
  setActiveProfilePhoto: () => {},
  tokedIds: [],
  setTokedIds: () => {},
  getCurrUsersTokenIds: () => {},
  getUpdatedProfileNft: () => {},
});

const StateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [userAddress, setUserAddress] = useState('');
  const [connected, setConnected] = useState(false);
  const [activeProfilePhoto, setActiveProfilePhoto] = useState('');
  const [tokedIds, setTokedIds] = useState<number[]>([]);

  useEffect(() => {
    const initializeProvider = async () => {
      try {
        await detectConnection();

        setConnected(true);
        const wallet = await connectWallet();
        console.log('wallet', wallet);
        setUserAddress(wallet.address);
        if (wallet.address) {
          setConnected(true);
        }

        const mintFee = await getMintFee();

        console.log('mintFee:', mintFee);

        getActiveProfileNft().then((res) => {
          setActiveProfilePhoto(res);
        });
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
      connected,
      setConnected,
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
      connected,
      setConnected,
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
      {children}
    </Context.Provider>
  );
};

export default StateProvider;

export const useStateContext = () => useContext(Context);
