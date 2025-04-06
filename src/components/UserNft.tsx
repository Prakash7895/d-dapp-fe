import { changeProfileNft, getUserTokenUriById } from '@/utils';
import React, { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useStateContext } from './StateProvider';
import Loader from './Loader';

interface UserNftProps {
  tokenId: number;
}

const UserNft: FC<UserNftProps> = ({ tokenId }) => {
  const { getUpdatedProfileNft } = useStateContext();
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUserTokenUriById(tokenId).then((res) => {
      if (res) {
        setImageUri(res);
      }
      setLoading(false);
      console.log('RESssss', res);
    });
  }, [tokenId]);

  const handleProfileNftChange = () => {
    setUpdating(true);
    changeProfileNft(tokenId).then((res) => {
      if (res) {
        toast.success('Profile Photo updated successfully.');
        getUpdatedProfileNft();
      } else {
        toast.error('Error updatingProfile Photo.');
      }
      setUpdating(false);
    });
  };

  console.log('imageUri', imageUri);

  return (
    <div
      className={`relative group overflow-hidden ${
        imageUri ? 'cursor-pointer' : ''
      }`}
    >
      <div className='border-[1px] border-gray-600 bg-white dark:bg-neutral-900 rounded-lg overflow-hidden p-1'>
        {imageUri ? (
          <img
            src={imageUri}
            alt='User Profile Image'
            className='h-52 w-52 object-cover rounded-md'
          />
        ) : loading ? (
          <div className='h-52 w-52 p-2 flex items-center justify-center'>
            <Loader />
          </div>
        ) : (
          <div className='h-52 w-52 p-2'>Not Available</div>
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
              {updating ? (
                <Loader />
              ) : (
                <button
                  className='p-[3px] relative'
                  onClick={handleProfileNftChange}
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg' />
                  <div className='px-4 py-2 bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent'>
                    Use as Profile Photo
                  </div>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserNft;
