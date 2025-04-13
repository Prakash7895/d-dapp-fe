'use client';
import React, { useState } from 'react';
import { useStateContext } from './StateProvider';
import { updateWalletAddress } from '@/apiCalls';
import { toast } from 'react-toastify';
import { Loader2, Check, Wallet } from 'lucide-react';

const WalletInfo: React.FC = () => {
  const { userInfo, setUserInfo } = useStateContext();
  const [loading, setLoading] = useState<string | null>(null);

  const linkedWallets = userInfo?.linkedAddresses
    ? userInfo?.linkedAddresses
    : [];

  const handleSetActiveWallet = async (address: string) => {
    if (!userInfo?.id) return;

    setLoading(address);
    try {
      const updatedUser = await updateWalletAddress(+userInfo.id, {
        selectedAddress: address,
      });

      if (updatedUser) {
        setUserInfo(updatedUser);
        sessionStorage.setItem('savedWalletAddress', address!);
        toast.success('Wallet address updated successfully');
      } else {
        toast.error('Failed to update wallet address');
      }
    } catch (error) {
      console.error('Error updating wallet address:', error);
      toast.error('An error occurred while updating your wallet address');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className=''>
      <div className='mb-8'>
        <h3 className='text-lg font-semibold text-white mb-4'>
          Current Wallet
        </h3>
        <div className='bg-gray-700 rounded-lg p-4 flex items-center justify-between'>
          <div className='flex items-center'>
            <Wallet className='h-5 w-5 text-primary-500 mr-3' />
            <div>
              <p className='text-white font-medium'>Active Wallet</p>
              <p className='text-gray-300 text-sm break-all'>
                {userInfo?.selectedAddress || 'No wallet connected'}
              </p>
            </div>
          </div>
          {userInfo?.selectedAddress && (
            <div className='bg-primary-500 text-white px-3 py-1 rounded-full text-xs flex items-center'>
              <Check className='h-3 w-3 mr-1' />
              Active
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className='text-lg font-semibold text-white mb-4'>
          Linked Wallets
        </h3>
        {linkedWallets.length > 0 ? (
          <div className='space-y-3'>
            {linkedWallets.map((wallet) => {
              const isActive = wallet === userInfo?.selectedAddress;
              return (
                <div
                  key={wallet}
                  className='bg-gray-700 rounded-lg p-4 flex items-center justify-between'
                >
                  <div className='flex items-center'>
                    <Wallet className='h-5 w-5 text-gray-400 mr-3' />
                    <p className='text-gray-300 text-sm break-all'>{wallet}</p>
                  </div>
                  <button
                    onClick={() => handleSetActiveWallet(wallet)}
                    disabled={loading === wallet || isActive}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-500 text-white cursor-default'
                        : 'bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50'
                    }`}
                  >
                    {loading === wallet ? (
                      <div className='flex items-center'>
                        <Loader2 className='h-3 w-3 animate-spin mr-1' />
                        <span>Updating...</span>
                      </div>
                    ) : isActive ? (
                      <div className='flex items-center'>
                        <Check className='h-3 w-3 mr-1' />
                        <span>Active</span>
                      </div>
                    ) : (
                      'Set as Active'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='bg-gray-700 rounded-lg p-4 text-center'>
            <p className='text-gray-300'>No linked wallets found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletInfo;
