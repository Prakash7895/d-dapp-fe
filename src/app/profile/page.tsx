import GridPattern from '@/components/GridPattern';
import ProfileMintNft from '@/components/ProfileMintNft';
import React from 'react';

const Profile = () => {
  return (
    <div>
      <div className='border-b-2 border-gray-800'>
        <GridPattern columns={'width'} rows={5} />
        <div className='relative md:mx-52 mx-16'>
          <div className='border-[1px] border-gray-600 bg-white dark:bg-neutral-900 absolute -top-12 rounded-lg overflow-hidden p-1'>
            <img
              src='https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg'
              alt='User Profile Image'
              className='h-36 rounded-md'
            />
          </div>
          <div className='pl-44 pb-3'>
            <p className='text-3xl mb-2'>John, Doe</p>
            <p>Male, Tokyo</p>
          </div>
        </div>
      </div>
      <div className='md:mx-52 mx-16 mt-20'>
        <div className='flex justify-between'>
          <p>My NFT's</p>
          <ProfileMintNft />
        </div>
      </div>
    </div>
  );
};

export default Profile;
