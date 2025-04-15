'use client';
import { capitalizeFirstLetter } from '@/utils';
import { useStateContext } from './StateProvider';
import { BadgeCheck, BadgeInfo, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWalletContext } from './WalletHandler';
import ProfilePictureUploader from './ProfilePictureUploader';
import { getSignedUrl } from '@/apiCalls';

const ProfileInfo = () => {
  const { activeProfilePhoto, userInfo, getUpdatedProfileNft } =
    useStateContext();
  const { connectedToValidAddress } = useWalletContext();

  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    if (!activeProfilePhoto && connectedToValidAddress) {
      getUpdatedProfileNft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfilePhoto, connectedToValidAddress]);

  useEffect(() => {
    if (userInfo?.profilePicture) {
      getSignedUrl(encodeURIComponent(userInfo.profilePicture)).then((res) => {
        if (res.status === 'success') {
          setProfilePicture(res.data!);
        }
      });
    }
  }, [userInfo]);

  return (
    <div className='relative md:mx-24 lg:mx-52 mx-16'>
      <div className='border-[1px] border-gray-600 bg-white dark:bg-neutral-900 absolute -bottom-4 rounded-lg overflow-hidden p-1 z-10'>
        {activeProfilePhoto || profilePicture ? (
          <div className='h-36 w-36 relative group'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profilePicture || activeProfilePhoto}
              alt='User Profile Image'
              className='h-full w-full object-cover rounded-md'
            />
            <ProfilePictureUploader
              trigger={<Pencil className='text-white h-8 w-8' />}
              triggerClassName='absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md'
            />
          </div>
        ) : (
          <div className='h-36 w-36 flex flex-col gap-2 items-center justify-center'>
            <BadgeInfo color='#f55' />
            <p className='text-center'>
              Mint Profile NFT to verify your account
            </p>
          </div>
        )}
      </div>
      <div className='pl-44 pb-3 absolute -bottom-0 space-y-1.5'>
        <p className='text-3xl flex items-center gap-2'>
          {userInfo?.firstName} {userInfo?.lastName}
          {activeProfilePhoto ? <BadgeCheck color='#5f5' /> : <></>}
        </p>
        <p>{userInfo?.email}</p>
        <p>
          {userInfo?.age}, {capitalizeFirstLetter(userInfo?.gender ?? '')}
        </p>
        {userInfo?.city && userInfo?.country && (
          <p>
            {capitalizeFirstLetter(userInfo.city)},{' '}
            {capitalizeFirstLetter(userInfo.country)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
