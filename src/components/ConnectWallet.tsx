import React, { useState } from 'react';
import Button from './Button';
import { connectWallet } from '@/contract';
import { useStateContext } from './StateProvider';
import { toast } from 'react-toastify';
import { updateWalletAddress } from '@/apiCalls';

const ConnectWallet = () => {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const { setSelectedAddress, userInfo } = useStateContext();

  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      setError('');
      const wallet = await connectWallet();
      if (wallet && wallet.address) {
        setSelectedAddress(wallet.address);
        if (!userInfo?.selectedAddress && userInfo?.id) {
          updateWalletAddress(+userInfo.id, {
            selectedAddress: wallet.address,
          });
        }
        toast.success('Wallet connected successfully!');
      }
    } catch (error) {
      setError((error as Error).message || 'Failed to connect wallet');
      toast.error((error as Error).message || 'Failed to connect wallet');
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
      {error && (
        <div className='mb-4 p-3 bg-red-900 text-red-200 rounded-md'>
          {error}
        </div>
      )}
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
