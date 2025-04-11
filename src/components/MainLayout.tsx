'use client';

import React, { ReactNode } from 'react';
import Navbar from './Navbar';

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className='flex-1'>{children}</main>
    </>
  );
};

export default MainLayout;
