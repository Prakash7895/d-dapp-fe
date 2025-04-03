'use client';
import { connectWallet, detectConnection, getMintFee } from '@/utils';
import React, {
  createContext,
  FC,
  ReactNode,
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
}>({
  userAddress: '',
  setUserAddress: () => {},
  connected: false,
  setConnected: () => {},
});

const StateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [userAddress, setUserAddress] = useState('');
  const [connected, setConnected] = useState(false);

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
      } catch (err: any) {
        console.log(err);
        toast.error(err?.message || 'Failed to detect connection');
      }
    };

    initializeProvider();
  }, []);

  const value = useMemo(
    () => ({ userAddress, connected, setConnected, setUserAddress }),
    [userAddress, connected, setConnected, setUserAddress]
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
