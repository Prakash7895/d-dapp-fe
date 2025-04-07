'use client';
import {
  connectWallet,
  detectConnection,
  getActiveProfileNft,
  getMintFee,
  getUserTokenIds,
} from '@/contract';
import { User } from '@/types/user';
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
import Loader from './Loader';

interface OnboardedProps {
  profileMinted: boolean;
  userInfoSaved: null | User;
}

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
  onboardInfo: OnboardedProps;
  setOnboardInfo: React.Dispatch<React.SetStateAction<OnboardedProps>>;
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
  onboardInfo: { profileMinted: false, userInfoSaved: null },
  setOnboardInfo: () => {},
});

const StateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [userAddress, setUserAddress] = useState('');
  const [connected, setConnected] = useState(false);
  const [activeProfilePhoto, setActiveProfilePhoto] = useState('');
  const [tokedIds, setTokedIds] = useState<number[]>([]);
  const [onboardInfo, setOnboardInfo] = useState<OnboardedProps>({
    profileMinted: false,
    userInfoSaved: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeProvider = async () => {
      try {
        setLoading(true);
        const accounts = await detectConnection();

        if (accounts.length) {
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
            if (res) {
              setOnboardInfo((p) => ({ ...p, profileMinted: true }));
              setActiveProfilePhoto(res);
              setLoading(false);
            }
          });
        }
      } catch (err: any) {
        console.log(err);
        toast.error(err?.message || 'Failed to detect connection');
      }
    };

    initializeProvider();
  }, []);

  useEffect(() => {
    if (
      userAddress &&
      onboardInfo.profileMinted &&
      !onboardInfo.userInfoSaved
    ) {
      fetch(`/api/user/${userAddress}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.data) {
            setOnboardInfo((p) => ({ ...p, userInfoSaved: res.data }));
          }
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to get user info');
        });
    }
  }, [userAddress, onboardInfo]);

  const getCurrUsersTokenIds = useCallback(() => {
    if (onboardInfo.profileMinted) {
      getUserTokenIds().then((res) => {
        if (res) {
          setTokedIds(res);
        }
      });
    }
  }, [onboardInfo]);

  const getUpdatedProfileNft = useCallback(() => {
    if (onboardInfo.profileMinted) {
      getActiveProfileNft().then((p) => {
        setActiveProfilePhoto(p);
      });
    }
  }, [onboardInfo]);

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
      onboardInfo,
      setOnboardInfo,
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
      onboardInfo,
      setOnboardInfo,
    ]
  );

  return (
    <Context.Provider value={value}>
      <ToastContainer />
      {loading ? (
        <div className='h-full flex justify-center items-center'>
          <Loader size={96} />
        </div>
      ) : (
        children
      )}
    </Context.Provider>
  );
};

export default StateProvider;

export const useStateContext = () => useContext(Context);
