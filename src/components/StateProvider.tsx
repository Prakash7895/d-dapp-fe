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
import { useEthereum, useSoulboundNFTContract } from './EthereumProvider';
import { formatEther } from 'ethers';
import { usePathname, useRouter } from 'next/navigation';

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
  loading: boolean;
}

const Context = createContext<ContextState>({} as ContextState);

export const checkIfUserOnboarded = (data: UserResponse) => {
  return !!(
    data?.profile?.profilePicture &&
    data?.profile?.bio &&
    data?.profile?.city
  );
};

const StateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAddress, setSelectedAddress] = useState('');
  const [activeProfilePhoto, setActiveProfilePhoto] = useState('');
  const [tokedIds, setTokedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserResponse | null>(null);
  const [multiSigWallets, setMultiSigWallets] = useState<string[]>([]);
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const { provider } = useEthereum();
  const soulboundNFTContract = useSoulboundNFTContract();
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    setLoading(true);
    getUserInfo().then((res) => {
      if (res?.status === 'success') {
        setUserInfo(res.data!);
        sessionStorage.setItem(
          'savedWalletAddress',
          JSON.stringify(res.data!.walletAddress ?? null)
        );
      }
    });
  }, []);

  useEffect(() => {
    if (userInfo) {
      if (pathName === '/onboarding') {
        setLoading(false);
      }
      if (!checkIfUserOnboarded(userInfo)) {
        router.replace('/onboarding');
      } else {
        setLoading(false);
      }
    }
  }, [userInfo, pathName]);

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
          setMultiSigWallets(res.data!.multiSigWallets);
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

      for (let i = 0; i < multiSigWallets.length; i++) {
        const bal = await provider?.getBalance(multiSigWallets[i]);

        if (bal) {
          total += +formatEther(bal);
        }
      }

      setTotalBalance(total);
    }
  }, [provider, multiSigWallets, setTotalBalance]);

  useEffect(() => {
    getMulitSigBalances();
  }, [multiSigWallets]);

  const getCurrUsersTokenIds = useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        getUserTokenIds(soulboundNFTContract, userInfo!.walletAddress)
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
    [soulboundNFTContract, userInfo?.walletAddress]
  );

  const getUpdatedProfileNft = useCallback(
    () =>
      getActiveProfileNft(soulboundNFTContract, userInfo!.walletAddress).then(
        (p) => {
          if (p) {
            setActiveProfilePhoto(p);
          }
        }
      ),
    [soulboundNFTContract, userInfo?.walletAddress]
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
      loading,
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
      loading,
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
