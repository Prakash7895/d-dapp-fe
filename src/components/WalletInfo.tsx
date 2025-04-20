'use client';
import React from 'react';
import { useStateContext } from './StateProvider';
import { Check, Wallet } from 'lucide-react';

const WalletInfo: React.FC = () => {
  const { userInfo } = useStateContext();

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
                {userInfo?.walletAddress || 'No wallet connected'}
              </p>
            </div>
          </div>
          {userInfo?.walletAddress && (
            <div className='bg-primary-500 text-white px-3 py-1 rounded-full text-xs flex items-center'>
              <Check className='h-3 w-3 mr-1' />
              Active
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;
