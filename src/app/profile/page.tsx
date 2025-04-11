import GridPattern from '@/components/GridPattern';
import ListUserNfts from '@/components/ListUserNfts';
import ProfileInfo from '@/components/ProfileInfo';
import MintNftModal from '@/components/MintNftModal';
import React from 'react';
import { PenLine } from 'lucide-react';
import { Tab, Tabs } from '@/components/Tabs';
import UserSettings from '@/components/UserSettings';

export default function ProfilePage() {
  const tabs: Tab[] = [
    {
      title: 'NFTs',
      value: 'nfts',
      content: (
        <>
          <div className='flex justify-between items-center'>
            <p>My NFT's</p>
            <MintNftModal
              trigger={<PenLine />}
              triggerClassName='disabled:opacity-50'
            />
          </div>
          <ListUserNfts />
        </>
      ),
    },
    {
      title: 'Setting',
      value: 'sett',
      content: <UserSettings />,
    },
  ];

  return (
    <div>
      <div className='border-b-2 border-gray-800'>
        <GridPattern columns={'width'} rows={5} />
        <ProfileInfo />
      </div>
      <div className='md:mx-52 mx-16 mt-20'>
        <Tabs tabs={tabs} contentClassName='mt-10' />
      </div>
    </div>
  );
}
