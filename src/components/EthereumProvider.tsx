import { JsonRpcSigner } from 'ethers';
import { Contract } from 'ethers';
import { BrowserProvider } from 'ethers';
import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import soulboundNftAbi from '@/abis/SooulboundNft.json';
import matchMakingAbi from '@/abis/MatchMaking.json';
import walletAbi from '@/abis/SimpleMultiSig.json';
import ScreenLoader from './ScreenLoader';
import { useStateContext } from './StateProvider';

interface EthereumContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  chainId: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const EthereumContext = createContext<EthereumContextType>(
  {} as EthereumContextType
);

const EthereumProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { userInfo } = useStateContext();

  const connect = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return;
    }

    setIsConnecting(true);
    try {
      // Request accounts
      console.log('Requesting accounts...');
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Initialize provider
      const provider = new BrowserProvider(window.ethereum);
      setProvider(provider);

      // Get chain ID
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString(16);
      setChainId(chainId);

      // Get signer and address
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setSigner(signer);
      setAddress(address);
      setIsConnected(true);
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
  };

  useEffect(() => {
    if (window.ethereum && userInfo?.walletAddress) {
      connect();
    }

    // Setup event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        connect();
      });

      window.ethereum.on('chainChanged', () => {
        connect();
      });

      window.ethereum.on('disconnect', () => {
        disconnect();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', connect);
        window.ethereum.removeListener('chainChanged', connect);
        window.ethereum.removeListener('disconnect', disconnect);
      }
    };
  }, [userInfo]);

  return (
    <EthereumContext.Provider
      value={{
        provider,
        signer,
        address,
        chainId,
        isConnecting,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {isConnecting ? <ScreenLoader /> : children}
    </EthereumContext.Provider>
  );
};

export const useEthereum = () => useContext(EthereumContext);

export const useContract = (address: string, abi: any) => {
  const { signer, provider } = useEthereum();
  const [isDeployed, setIsDeployed] = useState(false);

  useEffect(() => {
    const checkDeployment = async () => {
      if (!provider || !address) return;

      try {
        const code = await provider.getCode(address);
        setIsDeployed(code !== '0x');
      } catch (error) {
        console.log('Error checking contract deployment:', error);
        setIsDeployed(false);
      }
    };

    checkDeployment();
  }, [provider, address]);

  return useMemo(() => {
    if (!address || !abi || !signer || !isDeployed) return null;

    try {
      return new Contract(address, abi, signer);
    } catch (error) {
      console.log('Failed to create contract instance:', error);
      return null;
    }
  }, [address, abi, signer, isDeployed]);
};

export const useMatchMakingContract = () =>
  useContract(process.env.NEXT_PUBLIC_MATCH_MAKING_ADDRESS!, matchMakingAbi);

export const useSoulboundNFTContract = () =>
  useContract(process.env.NEXT_PUBLIC_SOULBOUND_NFT_ADDRESS!, soulboundNftAbi);

export const useMultiSigWalletContract = (address: string) =>
  useContract(address, walletAbi);

export default EthereumProvider;
