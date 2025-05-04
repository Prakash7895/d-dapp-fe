'use client';

import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

const MainLayout = ({ children }: { children: ReactNode }) => {
  const pathName = usePathname();

  return (
    <>
      {pathName !== '/onboarding' ? <Navbar /> : <></>}
      <main className='flex-1'>{children}</main>
    </>
  );
};

export default MainLayout;
