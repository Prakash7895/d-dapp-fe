import GridPattern from '@/components/GridPattern';
import ListUserNfts from '@/components/ListUserNfts';
import ProfileInfo from '@/components/ProfileInfo';
import MintNftModal from '@/components/MintNftModal';
import React from 'react';
import { PenLine } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div>
      <div className='border-b-2 border-gray-800'>
        <GridPattern columns={'width'} rows={5} />
        <ProfileInfo />
      </div>
      <div className='md:mx-52 mx-16 mt-20'>
        <div className='flex justify-between items-center mb-2'>
          <p>My NFT's</p>
          <MintNftModal trigger={<PenLine />} />
        </div>
        <ListUserNfts />
      </div>
    </div>
  );
}
