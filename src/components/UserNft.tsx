'use client';

import { changeProfileNft, getUserTokenUriById } from '@/contract';
import React, { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useStateContext } from './StateProvider';
import Loader from './Loader';
import { useSoulboundNFTContract } from './EthereumProvider';

interface UserNftProps {
  tokenId: number;
}

const UserNft: FC<UserNftProps> = ({ tokenId }) => {
  const { getUpdatedProfileNft, activeProfilePhoto } = useStateContext();
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const soulboundNFTContract = useSoulboundNFTContract();

  useEffect(() => {
    setLoading(true);
    getUserTokenUriById(soulboundNFTContract, tokenId).then((res) => {
      if (res) {
        setImageUri(res);
      }
      setLoading(false);
    });
  }, [tokenId, soulboundNFTContract]);

  const handleProfileNftChange = () => {
    setUpdating(true);
    changeProfileNft(soulboundNFTContract, tokenId).then((res) => {
      if (res) {
        toast.success('Profile Photo updated successfully.');
        getUpdatedProfileNft();
      } else {
        toast.error('Error updatingProfile Photo.');
      }
      setUpdating(false);
    });
  };

  const isActive = activeProfilePhoto === imageUri;

  return (
    <div
      className={`relative group overflow-hidden rounded-lg border-2 ${
        isActive ? 'border-primary-500' : 'border-gray-700'
      }`}
    >
      <div className='border-[1px] border-gray-600 bg-white dark:bg-neutral-900 rounded-lg overflow-hidden p-1'>
        {imageUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUri}
            alt={`NFT #${tokenId}`}
            className='h-52 w-52 object-cover rounded-md'
          />
        ) : loading ? (
          <div className='h-52 w-52 p-2 flex items-center justify-center'>
            <Loader />
          </div>
        ) : (
          <div className='w-full h-64 bg-gray-700 flex items-center justify-center'>
            <span className='text-gray-400'>Image not available</span>
          </div>
        )}
      </div>
      {imageUri && (
        <>
          <div
            className={`absolute bg-black opacity-75 ${
              updating ? 'bottom-0' : '-bottom-56'
            } group-hover:bottom-0 z-10 h-full w-full transition-all duration-300 ease-in-out rounded-md`}
          ></div>
          <div
            className={`absolute ${
              updating ? 'bottom-0' : '-bottom-56'
            } group-hover:bottom-0 z-10 h-full w-full transition-all duration-300 ease-in-out rounded-md flex justify-center items-center`}
          >
            <div>
              {isActive ? (
                <div className='bg-primary-500 text-white px-4 py-2 rounded-md'>
                  Active Profile Photo
                </div>
              ) : (
                <button
                  onClick={() => handleProfileNftChange()}
                  disabled={updating}
                  className={`${
                    updating ? '' : 'bg-primary-600 hover:bg-primary-700'
                  } text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50`}
                >
                  {updating ? (
                    <div className='flex flex-col items-center gap-2'>
                      <Loader />
                      <span className='ml-2'>Updating...</span>
                    </div>
                  ) : (
                    'Set as Profile Photo'
                  )}
                </button>
              )}
            </div>
          </div>
        </>
      )}
      {isActive && (
        <div className='absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs'>
          Active
        </div>
      )}
    </div>
  );
};

export default UserNft;
