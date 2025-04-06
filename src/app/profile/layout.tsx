import Header from '@/components/Header';
import React from 'react';

const ProfileLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <Header href='/'>{children}</Header>;
};

export default ProfileLayout;
