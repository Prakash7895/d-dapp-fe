import GridPattern from '@/components/GridPattern';
import ListUserNfts from '@/components/ListUserNfts';
import ProfileInfo from '@/components/ProfileInfo';
import ProfileMintNft from '@/components/ProfileMintNft';
import React from 'react';

const Profile = () => {
  return (
    <div>
      <div className='border-b-2 border-gray-800'>
        <GridPattern columns={'width'} rows={5} />
        <ProfileInfo />
      </div>
      <div className='md:mx-52 mx-16 mt-20'>
        <div className='flex justify-between'>
          <p>My NFT's</p>
          <ProfileMintNft />
        </div>
        <ListUserNfts />
      </div>
    </div>
  );
};

export default Profile;
