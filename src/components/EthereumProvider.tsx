'use client';

import { JsonRpcSigner } from 'ethers';
import { Contract } from 'ethers';
import { BrowserProvider } from 'ethers';
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
import { toast } from 'react-toastify';
import soulboundNftAbi from '@/abis/SoulboundNft.json';
import matchMakingAbi from '@/abis/MatchMaking.json';
import walletAbi from '@/abis/SimpleMultiSig.json';
import { handleTransactionError } from '@/contract';

interface EthereumContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  connectedAddress: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<JsonRpcSigner | null>;
  disconnect: () => void;
  detectConnection: () => Promise<string[]>;
  isWalletPresent: boolean;
}

const EthereumContext = createContext<EthereumContextType>(
  {} as EthereumContextType
);

const EthereumProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState('');
  const [isWalletPresent] = useState(() =>
    typeof window?.ethereum !== 'undefined' ? true : false
  );

  const detectConnection = useCallback(async () => {
    if (isWalletPresent) {
      try {
        const accounts = await window.ethereum?.request({
          method: 'eth_accounts',
        });

        return accounts ?? [];
      } catch (err: unknown) {
        console.log('User rejected the request', err);
        toast.error((err as Error).message || 'Failed to detect connection');
        return [];
      }
    }
    return [];
  }, [isWalletPresent]);

  useEffect(() => {
    detectConnection().then((accounts) => {
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        setConnectedAddress(accounts[0]?.toLowerCase());
        connect();
      } else {
        setIsConnected(false);
      }
    });
  }, []);

  const connect = async () => {
    console.log('Connecting to MetaMask...');
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return null;
    }

    setIsConnecting(true);
    try {
      // Request accounts
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Initialize provider
      const _provider = new BrowserProvider(window.ethereum);
      setProvider(_provider);

      // Get chain ID
      const network = await _provider.getNetwork();
      const _chainId = Number(network.chainId);
      setChainId(_chainId);

      // Get signer and address
      const _signer = await _provider.getSigner();
      const _address = await _signer.getAddress();

      setSigner(_signer);
      setConnectedAddress(_address);
      setIsConnected(true);

      return _signer;
    } catch (error: unknown) {
      console.log('Connection error:', error);
      handleTransactionError(error);
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    setConnectedAddress('');
  };

  useEffect(() => {
    // Setup event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (acc: string[]) => {
        if (acc.length === 0) {
          disconnect();
        } else {
          setConnectedAddress(acc[0]?.toLowerCase());
          connect();
        }
      });

      window.ethereum.on('chainChanged', (c) => {
        console.log('CHAIN', c);
      });

      window.ethereum.on('disconnect', () => {
        toast.error('Disconnected from wallet');
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
  }, []);

  return (
    <EthereumContext.Provider
      value={{
        provider,
        signer,
        chainId,
        isConnecting,
        isConnected,
        connect,
        disconnect,
        detectConnection,
        isWalletPresent,
        connectedAddress,
      }}
    >
      {children}
    </EthereumContext.Provider>
  );
};

export const useEthereum = () => useContext(EthereumContext);

export const useContract = (
  address: string,
  abi: Array<Record<string, unknown>>
) => {
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
