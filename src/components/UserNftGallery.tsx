'use client';

import React, { useEffect, useState } from 'react';
import { useStateContext } from './StateProvider';
import Loader from './Loader';
import MintNftModal from './MintNftModal';
import UserNft from './UserNft';
import { getUserTokenIds } from '@/contract';
import { useSoulboundNFTContract } from './EthereumProvider';

const UserNftGallery: React.FC = () => {
  const { tokedIds, userInfo, setTokedIds } = useStateContext();
  const [loading, setLoading] = useState(true);
  const soulboundNFTContract = useSoulboundNFTContract();

  useEffect(() => {
    setLoading(true);
    getUserTokenIds(soulboundNFTContract, userInfo?.walletAddress!)
      .then((res) => {
        if (res) {
          setTokedIds(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [soulboundNFTContract, userInfo?.walletAddress]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader />
      </div>
    );
  }

  if (tokedIds.length === 0) {
    return (
      <div className='text-center p-8 bg-gray-800 rounded-lg'>
        <h3 className='text-xl font-semibold text-white mb-4'>No NFTs Found</h3>
        <p className='text-gray-300 mb-4'>
          {"You haven't minted any NFTs yet."}
        </p>
        <MintNftModal
          trigger='Mint Your First NFT'
          triggerClassName='text-white bg-primary-500 enabled:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all'
        />
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
      {tokedIds.map((el) => (
        <UserNft key={el} tokenId={el} />
      ))}
    </div>
  );
};

export default UserNftGallery;
