'use client';

import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { useStateContext } from './StateProvider';
import ConnectWallet from './ConnectWallet';

const MainLayout = ({ children }: { children: ReactNode }) => {
  const { userAddress } = useStateContext();

  const isWalletConnected = !!userAddress;

  return (
    <>
      <Navbar />
      {!isWalletConnected ? (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
          <ConnectWallet />
        </div>
      ) : (
        <main className='flex-1'>{children}</main>
      )}
    </>
  );
};

export default MainLayout;
