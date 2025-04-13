'use client';

import React from 'react';
import UserNftGallery from '@/components/UserNftGallery';
import { useStateContext } from '@/components/StateProvider';
import MintNftModal from '@/components/MintNftModal';
import { PenLine } from 'lucide-react';

const UserNftsPage = () => {
  const { userInfo } = useStateContext();

  return (
    <div className='bg-gray-900 p-8 rounded-lg shadow-xl w-full mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-white'>My NFTs</h1>
        <div className='flex justify-between items-center'>
          <p className='text-gray-300 mt-2'>
            Manage your NFT collection and set your profile photo
          </p>
          <MintNftModal
            trigger={<PenLine />}
            triggerClassName='disabled:opacity-50'
          />
        </div>
      </div>
      {userInfo ? (
        <UserNftGallery />
      ) : (
        <div className='bg-gray-800 rounded-lg p-8 text-center'>
          <p className='text-gray-300'>
            Please connect your wallet to view your NFTs
          </p>
        </div>
      )}
    </div>
  );
};

export default UserNftsPage;
