import React, { useState } from 'react';
import Button from './Button';
import { connectWallet } from '@/contract';
import { useStateContext } from './StateProvider';
import { toast } from 'react-toastify';

const ConnectWallet = () => {
  const [connecting, setConnecting] = useState(false);
  const { setUserAddress } = useStateContext();

  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      const wallet = await connectWallet();
      if (wallet && wallet.address) {
        setUserAddress(wallet.address);
        toast.success('Wallet connected successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className='bg-gray-900 p-8 rounded-lg shadow-xl max-w-md w-full'>
      <h2 className='text-2xl font-bold text-white mb-4'>
        Connect Your Wallet
      </h2>
      <p className='text-gray-300 mb-6'>
        To use this application, you need to connect your wallet first.
      </p>
      <Button
        label='Connect Wallet'
        disabled={connecting}
        isLoading={connecting}
        loadingLabel='Connecting Wallet...'
        onClick={handleConnectWallet}
      />
    </div>
  );
};

export default ConnectWallet;
