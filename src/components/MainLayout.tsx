'use client';

import React, { ReactNode, useEffect } from 'react';
import Navbar from './Navbar';
import { useSession } from 'next-auth/react';
import ScreenLoader from './ScreenLoader';
import { usePathname, useRouter } from 'next/navigation';
import { useStateContext } from './StateProvider';
import ConnectWallet from './ConnectWallet';

const MainLayout = ({ children }: { children: ReactNode }) => {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const { userAddress } = useStateContext();

  useEffect(() => {
    if (status === 'unauthenticated' && !pathname?.startsWith('/auth/')) {
      router.replace('/auth/signin');
    }
  }, [status, pathname, router]);

  const isWalletConnected = !!userAddress;

  if (status === 'loading') {
    return <ScreenLoader />;
  }

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
