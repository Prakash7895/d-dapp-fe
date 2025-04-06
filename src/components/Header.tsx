import React, { FC, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  children: ReactNode;
  href: string;
}

const Header: FC<HeaderProps> = ({ children, href }) => {
  return (
    <div className='relative'>
      <Link
        className='absolute cursor-pointer rounded-full hover:bg-[#292929] transition-all p-2 z-50 left-8 top-4'
        title='Back'
        href={href}
      >
        <ArrowLeft />
      </Link>
      {children}
    </div>
  );
};

export default Header;
