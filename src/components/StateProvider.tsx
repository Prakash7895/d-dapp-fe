'use client';
import { getActiveProfileNft, getUserTokenIds } from '@/contract';
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
import { ToastContainer } from 'react-toastify';
import ScreenLoader from './ScreenLoader';
import MainLayout from './MainLayout';
import { User } from '@/types/user';
import { getUserInfo } from '@/apiCalls';
import WalletHandler from './WalletHandler';
import { signOut } from 'next-auth/react';

const Context = createContext<{
  selectedAddress: string;
  setSelectedAddress: React.Dispatch<React.SetStateAction<string>>;
  activeProfilePhoto: string;
  setActiveProfilePhoto: React.Dispatch<React.SetStateAction<string>>;
  tokedIds: number[];
  setTokedIds: React.Dispatch<React.SetStateAction<number[]>>;
  getCurrUsersTokenIds: () => void;
  getUpdatedProfileNft: () => Promise<void>;
  userInfo: User | null;
  setUserInfo: React.Dispatch<React.SetStateAction<User | null>>;
}>({
  selectedAddress: '',
  setSelectedAddress: () => {},
  activeProfilePhoto: '',
  setActiveProfilePhoto: () => {},
  tokedIds: [],
  setTokedIds: () => {},
  getCurrUsersTokenIds: () => {},
  getUpdatedProfileNft: () => new Promise((r) => r),
  userInfo: null,
  setUserInfo: () => {},
});

const StateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAddress, setSelectedAddress] = useState('');
  const [activeProfilePhoto, setActiveProfilePhoto] = useState('');
  const [tokedIds, setTokedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    setLoading(true);
    getUserInfo().then((res) => {
      if (res) {
        setUserInfo(res);
        sessionStorage.setItem('savedWalletAddress', res.selectedAddress!);
        setLoading(false);
      } else {
        signOut({ callbackUrl: '/auth/signin' });
      }
    });
  }, []);
  console.log('userInfo', userInfo);
  console.log('selectedAddress', selectedAddress);

  useEffect(() => {
    if (userInfo) {
      sessionStorage.setItem('savedWalletAddress', userInfo.selectedAddress!);
      sessionStorage.setItem('id', `${userInfo.id}`);
    }
  }, [userInfo]);

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
      selectedAddress,
      setSelectedAddress,
      activeProfilePhoto,
      setActiveProfilePhoto,
      tokedIds,
      setTokedIds,
      getCurrUsersTokenIds,
      getUpdatedProfileNft,
      userInfo,
      setUserInfo,
    }),
    [
      selectedAddress,
      setSelectedAddress,
      activeProfilePhoto,
      setActiveProfilePhoto,
      tokedIds,
      setTokedIds,
      getCurrUsersTokenIds,
      getUpdatedProfileNft,
      userInfo,
      setUserInfo,
    ]
  );

  return (
    <Context.Provider value={value}>
      <ToastContainer />
      {loading ? (
        <ScreenLoader />
      ) : (
        <WalletHandler>
          <MainLayout>{children}</MainLayout>
        </WalletHandler>
      )}
    </Context.Provider>
  );
};

export default StateProvider;

export const useStateContext = () => useContext(Context);
