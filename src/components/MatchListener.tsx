'use client';
import { Contract, Interface } from 'ethers';
import { WebSocketProvider } from 'ethers';
import { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import matchMakingAbi from '@/abis/MatchMaking.json';
import { useStateContext } from './StateProvider';
import { getUserByAddress } from '@/apiCalls';
import { UserByAddress } from '@/types/user';
import MatchAnimation from './MatchAnimation';

const MatchListener: FC<{ children: ReactNode }> = ({ children }) => {
  const [wsProvider, setWsProvider] = useState<WebSocketProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const { userInfo, fetchMultiSigWallets } = useStateContext();
  const [matchedUser, setMatchedUser] = useState<UserByAddress | null>(null);

  const getUserData = (address: string) => {
    getUserByAddress(address?.toLowerCase()).then((res) => {
      if (res.status === 'success') {
        toast.success("It's a match! 🎉");
        setMatchedUser(res.data!);
      } else {
        toast.error(res.message);
      }
    });
  };

  const setupEventListeners = useCallback(
    async (_contract: Contract) => {
      await _contract.removeAllListeners();

      // await _contract.on('Like', async (liker: string, target: string) => {
      //   console.log('📝 Like Event triggered');
      //   console.log('liker:', liker);
      //   console.log('target:', target);
      // });

      await _contract.on('Match', async (userA: string, userB: string) => {
        console.log('💕 Match Event triggered');
        console.log('userA:', userA);
        console.log('userB:', userB);
        console.log('userInfo?.walletAddress:', userInfo?.walletAddress);

        if (
          userInfo?.walletAddress &&
          [userA?.toLowerCase(), userB?.toLowerCase()].includes(
            userInfo.walletAddress?.toLowerCase()
          )
        ) {
          getUserData(
            userInfo.walletAddress.toLowerCase() === userA.toLowerCase()
              ? userB
              : userA
          );
        }
      });

      // await _contract.on(
      //   'MultiSigCreated',
      //   async (walletAddress: string, userA: string, userB: string) => {
      //     console.log('🔐 MultiSig Wallet Created Event triggered');
      //     console.log('walletAddress:', walletAddress);
      //     console.log('userA:', userA);
      //     console.log('userB:', userB);
      //   }
      // );

      const listenerCount = await _contract.listenerCount();
      console.log(`✅ Total event listeners attached: ${listenerCount}`);
    },
    [userInfo]
  );

  const disconnect = useCallback(async () => {
    try {
      if (contract) {
        await contract.removeAllListeners();
        setContract(null);
      }

      if (wsProvider) {
        await wsProvider.destroy();
        setWsProvider(null);
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }, [contract, wsProvider]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return;
    }
    const url = process.env.NEXT_PUBLIC_ALCHEMY_WEBSOCKET_URL;

    if (!url) {
      toast.error('ALCHEMY WEBSOCKET URL not defined');
      return;
    }

    const contractAddress = process.env.NEXT_PUBLIC_MATCH_MAKING_ADDRESS;
    if (!contractAddress) {
      toast.error('contract Address not defined');
      return;
    }

    setIsConnecting(true);
    try {
      const wsP = new WebSocketProvider(url);
      setWsProvider(wsP);

      const iface = new Interface(matchMakingAbi);

      const _contract = new Contract(contractAddress, iface, wsP);

      console.log('Attaching listeners...');
      await setupEventListeners(_contract);

      wsP.on('error', async (error) => {
        console.error('❌ WebSocket error:', error);
        await disconnect();
      });

      setContract(_contract);
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [disconnect]);

  useEffect(() => {
    if (
      window.ethereum &&
      !contract &&
      !wsProvider &&
      !isConnecting &&
      userInfo?.walletAddress
    ) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userInfo, contract, wsProvider, isConnecting]);

  return (
    <>
      <MatchAnimation
        matchedProfile={matchedUser}
        showMatch={!!matchedUser}
        onClose={() => {
          setMatchedUser(null);
          fetchMultiSigWallets();
        }}
      />
      {children}
    </>
  );
};

export default MatchListener;
