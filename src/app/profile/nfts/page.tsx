'use client';

import React from 'react';
import UserNftGallery from '@/components/UserNftGallery';
import { useStateContext } from '@/components/StateProvider';

const UserNftsPage = () => {
  const { userInfo } = useStateContext();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My NFTs</h1>
        <p className="text-gray-300 mt-2">
          Manage your NFT collection and set your profile photo
        </p>
      </div>

      {userInfo ? (
        <UserNftGallery />
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-300">Please connect your wallet to view your NFTs</p>
        </div>
      )}
    </div>
  );
};

export default UserNftsPage; 