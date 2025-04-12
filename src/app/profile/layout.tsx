'use client';
import GridPattern from '@/components/GridPattern';
import ProfileInfo from '@/components/ProfileInfo';
import { Tab, Tabs } from '@/components/Tabs';
import UserSettings from '@/components/UserSettings';
import React, { ReactNode } from 'react';
import UserNftsPage from './nfts/page';
import { useRouter } from 'next/navigation';

const ProfileLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const tabs: Tab[] = [
    {
      title: 'Profile',
      value: 'profile',
      onClick: () => {
        console.log('PROFILE');
        router.push('/profile');
      },
    },
    {
      title: 'NFTs',
      value: 'nfts',
      onClick: () => {
        console.log('NFTS');
        router.push('/profile/nfts');
      },
      //   content: (
      //     <>
      //       <UserNftsPage />
      //       {/* <div className='flex justify-between items-center'>
      //             <p>My NFT's</p>
      //             <MintNftModal
      //               trigger={<PenLine />}
      //               triggerClassName='disabled:opacity-50'
      //             />
      //           </div>
      //           <ListUserNfts /> */}
      //     </>
      //   ),
    },
    {
      title: 'Wallet',
      value: 'wallet',
      onClick: () => {
        console.log('NFTS');
        router.push('/profile/wallet');
      },
    },
  ];

  return (
    <div className='border-2 border-red-500'>
      <div className='border-b-2 border-gray-800'>
        <GridPattern columns={'width'} rows={5} />
        <ProfileInfo />
      </div>
      <div className='md:mx-24 lg:mx-52 mx-16 mt-20'>
        <Tabs tabs={tabs} containerClassName='mb-7' />
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;
