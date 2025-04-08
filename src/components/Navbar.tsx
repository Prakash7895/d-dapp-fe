'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStateContext } from './StateProvider';
import { BadgeInfo } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { activeProfilePhoto } = useStateContext();

  const isNftMinted = !!activeProfilePhoto;

  // Hide navbar on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null;
  }

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <nav className='bg-gray-900 border-b border-gray-800'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center'>
            <Link href='/' className='text-white font-bold text-xl'>
              Dating DApp
            </Link>
          </div>

          <div className='flex items-center'>
            {session ? (
              <div className='relative'>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className='flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none'
                >
                  <div className='w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center'>
                    <span className='text-white font-medium'>
                      {session.user?.name?.[0] ||
                        session.user?.email?.[0] ||
                        '?'}
                    </span>
                  </div>
                  <span className='hidden md:block'>
                    {session.user?.name || session.user?.email || 'User'}
                  </span>
                </button>

                {isMenuOpen && (
                  <div className='absolute z-50 right-0 mt-2 w-fit rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5'>
                    <div className='py-1'>
                      <div className='px-4 py-2 text-sm text-gray-300 border-b border-gray-700'>
                        <div className='font-medium'>
                          {session.user?.name || 'User'}
                        </div>
                        <div className='text-gray-400 truncate'>
                          {session.user?.email}
                        </div>
                      </div>
                      <Link
                        href='/profile'
                        onClick={() => setIsMenuOpen(false)}
                        className='flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
                      >
                        Profile{' '}
                        {!isNftMinted ? (
                          <BadgeInfo size={20} color='#f55' />
                        ) : (
                          <></>
                        )}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className='block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center space-x-4'>
                <Link
                  href='/auth/signin'
                  className='text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium'
                >
                  Sign in
                </Link>
                <Link
                  href='/auth/signup'
                  className='bg-primary-500 text-white hover:bg-primary-600 px-4 py-2 rounded-md text-sm font-medium'
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
