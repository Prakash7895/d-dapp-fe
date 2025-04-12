'use client';
import { capitalizeFirstLetter } from '@/utils';
import { useStateContext } from './StateProvider';
import { BadgeCheck, BadgeInfo } from 'lucide-react';
import { useEffect } from 'react';
import { useWalletContext } from './WalletHandler';

const ProfileInfo = () => {
  const { activeProfilePhoto, userInfo, getUpdatedProfileNft } =
    useStateContext();
  const { connectedToValidAddress } = useWalletContext();

  useEffect(() => {
    if (!activeProfilePhoto && connectedToValidAddress) {
      getUpdatedProfileNft();
    }
  }, [activeProfilePhoto, connectedToValidAddress]);

  return (
    <div className='relative md:mx-24 lg:mx-52 mx-16'>
      <div className='border-[1px] border-gray-600 bg-white dark:bg-neutral-900 absolute -top-12 rounded-lg overflow-hidden p-1'>
        {activeProfilePhoto ? (
          <img
            src={activeProfilePhoto}
            alt='User Profile Image'
            className='h-36 w-36 object-cover rounded-md'
          />
        ) : (
          <div className='h-36 w-36 flex flex-col gap-2 items-center justify-center'>
            <BadgeInfo color='#f55' />
            <p className='text-center'>
              Mint Profile NFT to verify your account
            </p>
          </div>
        )}
      </div>
      <div className='pl-44 pb-3'>
        <p className='text-3xl mb-2 flex items-center gap-2'>
          {userInfo?.firstName} {userInfo?.lastName}
          {activeProfilePhoto ? <BadgeCheck color='#5f5' /> : <></>}
        </p>
        <p className='mb-2'>{userInfo?.email}</p>
        <p>
          {userInfo?.age}, {capitalizeFirstLetter(userInfo?.gender ?? '')}
        </p>
      </div>
    </div>
  );
};

export default ProfileInfo;
