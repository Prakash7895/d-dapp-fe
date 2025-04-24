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
import ScreenLoader from './ScreenLoader';
import MainLayout from './MainLayout';
import { UserResponse } from '@/types/user';
import { getUserInfo, getUserMultiSigWallets } from '@/apiCalls';
import WalletHandler from './WalletHandler';
import MatchListener from './MatchListener';
import { useEthereum } from './EthereumProvider';
import { formatEther } from 'ethers';

interface ContextState {
  selectedAddress: string;
  setSelectedAddress: React.Dispatch<React.SetStateAction<string>>;
  activeProfilePhoto: string;
  setActiveProfilePhoto: React.Dispatch<React.SetStateAction<string>>;
  tokedIds: number[];
  setTokedIds: React.Dispatch<React.SetStateAction<number[]>>;
  getCurrUsersTokenIds: () => Promise<boolean>;
  getUpdatedProfileNft: () => Promise<void>;
  userInfo: UserResponse | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserResponse | null>>;
  totalBalance: number | null;
  getMulitSigBalances: () => Promise<void>;
  multiSigWallets: string[];
  fetchMultiSigWallets: () => Promise<void> | undefined;
}

const Context = createContext<ContextState>({} as ContextState);

const StateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAddress, setSelectedAddress] = useState('');
  const [activeProfilePhoto, setActiveProfilePhoto] = useState('');
  const [tokedIds, setTokedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserResponse | null>(null);
  const [multiSigWallets, setMultiSigWallets] = useState<string[]>([]);
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const { provider } = useEthereum();

  useEffect(() => {
    setLoading(true);
    getUserInfo().then((res) => {
      if (res?.status === 'success') {
        setUserInfo(res.data!);
        sessionStorage.setItem(
          'savedWalletAddress',
          JSON.stringify(res.data!.walletAddress ?? null)
        );
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (userInfo) {
      sessionStorage.setItem(
        'savedWalletAddress',
        JSON.stringify(userInfo.walletAddress ?? null)
      );
    }
  }, [userInfo]);

  const fetchMultiSigWallets = useCallback(() => {
    if (userInfo?.walletAddress) {
      return getUserMultiSigWallets(userInfo.walletAddress).then((res) => {
        if (res.status === 'success') {
          setMultiSigWallets(res.data?.multiSigWallets!);
        }
      });
    }
  }, [userInfo]);

  useEffect(() => {
    fetchMultiSigWallets();
  }, [userInfo]);

  const getMulitSigBalances = useCallback(async () => {
    if (multiSigWallets.length) {
      let total = 0;
      let totalWei = BigInt(0);
      for (let i = 0; i < multiSigWallets.length; i++) {
        const bal = await provider?.getBalance(multiSigWallets[i]);
        console.log('BAL:', bal!.toString());
        if (bal) {
          total += +formatEther(bal);
          totalWei += bal;
        }
      }
      console.log('total:', total);
      const totalEth = parseFloat(formatEther(totalWei));
      console.log('Total in Wei:', totalWei.toString());
      console.log('Total in ETH:', totalEth);
      setTotalBalance(total);
    }
  }, [provider, multiSigWallets, setTotalBalance]);

  useEffect(() => {
    getMulitSigBalances();
  }, [multiSigWallets]);

  const getCurrUsersTokenIds = useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        getUserTokenIds()
          .then((res) => {
            if (res) {
              setTokedIds(res);
              resolve(true);
            } else {
              resolve(false);
            }
          })
          .catch(() => resolve(false));
      }),
    []
  );

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
      totalBalance,
      getMulitSigBalances,
      multiSigWallets,
      fetchMultiSigWallets,
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
      totalBalance,
      getMulitSigBalances,
      multiSigWallets,
      fetchMultiSigWallets,
    ]
  );

  return (
    <Context.Provider value={value}>
      {loading ? (
        <ScreenLoader />
      ) : (
        <MatchListener>
          <WalletHandler>
            <MainLayout>{children}</MainLayout>
          </WalletHandler>
        </MatchListener>
      )}
    </Context.Provider>
  );
};

export default StateProvider;

export const useStateContext = () => useContext(Context);
