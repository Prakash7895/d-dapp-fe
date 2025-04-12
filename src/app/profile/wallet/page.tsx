'use client';

import React from 'react';
import WalletInfo from '@/components/WalletInfo';
import { useStateContext } from '@/components/StateProvider';

const UserWalletPage = () => {
  const { userInfo } = useStateContext();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Wallet Management</h1>
        <p className="text-gray-300 mt-2">
          View and manage your connected wallet addresses
        </p>
      </div>

      {userInfo ? (
        <WalletInfo />
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-300">Please connect your wallet to view your wallet information</p>
        </div>
      )}
    </div>
  );
};

export default UserWalletPage; 