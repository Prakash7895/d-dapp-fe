'use client';
import GridPattern from '@/components/GridPattern';
import ProfileInfo from '@/components/ProfileInfo';
import { Tab, Tabs } from '@/components/Tabs';
import React, { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ProfileLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathName = usePathname();
  console.log('pathName', pathName);

  const tabs = [
    {
      title: 'Profile',
      value: 'profile',
      path: '/profile',
    },
    {
      title: 'NFTs',
      value: 'nfts',
      path: '/profile/nfts',
    },
    {
      title: 'Wallet',
      value: 'wallet',
      path: '/profile/wallet',
    },
    {
      title: 'Security',
      value: 'security',
      path: '/profile/security',
    },
  ];

  const activeTabValue = tabs.find((el) => el.path === pathName)?.value;

  return (
    <div>
      <div className='border-b-2 border-gray-800'>
        <GridPattern columns={'width'} rows={5} />
        <ProfileInfo />
      </div>
      <div className='md:mx-24 lg:mx-52 mx-16 mt-20 mb-10'>
        <Tabs
          tabs={tabs.map((el) => ({
            title: el.title,
            value: el.value,
            onClick: () => {
              router.push(el.path);
            },
          }))}
          containerClassName='mb-7'
          activeTabValue={activeTabValue}
        />
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;
