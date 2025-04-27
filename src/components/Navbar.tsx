'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BadgeInfo,
  Home,
  Heart,
  User,
  LogOut,
  HeartHandshake,
  MessageSquare,
  Bell,
} from 'lucide-react';
import useSession from '../hooks/useSession';
import useClickOutside from '../hooks/useClickOutside';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSignedUrl, logout } from '@/apiCalls';
import { useStateContext } from './StateProvider';
import { disconnectSocket } from '@/socket';
import { useAppSelector } from '@/store';
import AnimatedTooltip from './AnimatedTooltip';

export default function Navbar() {
  const { data: session, clearSession } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { activeProfilePhoto, userInfo } = useStateContext();
  const divRef = useRef<HTMLDivElement>(null);
  const [profilePicture, setProfilePicture] = useState('');
  const { chats } = useAppSelector('chat');

  const unreadMessages = chats.reduce(
    (acc, chat) => acc + (chat.unreadCount || 0),
    0
  );

  const isNftMinted = !!activeProfilePhoto;

  const router = useRouter();

  const handleLogout = async () => {
    setIsMenuOpen(false);

    disconnectSocket();
    await logout().then(() => {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('savedWalletAddress');
      clearSession();
      router.replace('/auth/signin');
    });
  };

  useClickOutside(divRef, () => {
    setIsMenuOpen(false);
  });

  useEffect(() => {
    if (userInfo?.profile?.profilePicture) {
      getSignedUrl(encodeURIComponent(userInfo.profile.profilePicture)).then(
        (res) => {
          if (res.status === 'success') {
            setProfilePicture(res.data!);
          }
        }
      );
    }
  }, [userInfo]);

  // Hide navbar on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null;
  }

  const name = session?.user
    ? `${session.user.firstName} ${session.user.lastName}`
    : '';

  const unreadNotifications = userInfo?.unreadNotifications || 0;

  const className = `flex items-center space-x-3 md:space-x-2 px-4 md:px-3 py-3 md:py-2 md:text-base md:rounded-lg transition-colors text-sm text-gray-300 hover:bg-gray-700/50`;
  const activeClassName = (condition: boolean) =>
    condition
      ? 'md:bg-gray-800 bg-gray-900 text-white'
      : 'text-gray-300 hover:text-white hover:md:bg-gray-800/50 hover:bg-gray-700/50 ';

  const discover = (
    <Link
      href='/'
      className={`${className} ${activeClassName(pathname === '/')}`}
    >
      <Home className='h-5 w-5' />
      <span>Discover</span>
    </Link>
  );

  const liked = (
    <Link
      href='/liked'
      className={`${className} ${activeClassName(pathname === '/liked')}`}
    >
      <Heart className='h-5 w-5' />
      <span>Liked</span>
    </Link>
  );

  const matches = (
    <Link
      href='/matches'
      className={`${className} ${activeClassName(pathname === '/matches')}`}
    >
      <HeartHandshake className='h-5 w-5' />
      <span>Matches</span>
    </Link>
  );

  const messages = (
    <Link
      href='/chat'
      className={`relative ${className} ${activeClassName(
        pathname.includes('/chat')
      )}`}
    >
      <MessageSquare className='h-5 w-5' />
      <span>Messages</span>

      {unreadMessages > 0 && (
        <span className='absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
          {unreadMessages > 99 ? '99+' : unreadMessages}
        </span>
      )}
    </Link>
  );

  return (
    <nav className='z-50 w-full bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 w-full'>
          {/* Logo and Main Navigation */}
          <div className='flex items-center space-x-8'>
            <Link href='/' className='flex items-center space-x-2'>
              <span className='text-2xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent'>
                Dating DApp
              </span>
            </Link>

            {session && (
              <div className='hidden md:flex items-center space-x-6'>
                {discover}
                {liked}
                {matches}
                {messages}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className='flex items-center'>
            {session ? (
              <div className='flex w-full items-center space-x-4'>
                <Link
                  href='/notifications'
                  className='relative flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors'
                >
                  <Bell className='h-5 w-5 text-gray-300' />
                  {unreadNotifications > 0 && (
                    <span className='absolute min-h-5 min-w-5 -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center p-0.5'>
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </Link>

                <div ref={divRef} className='relative flex-1'>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className='flex w-full items-center space-x-3 focus:outline-none group'
                  >
                    <div className='relative shrink-0'>
                      <div className='w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 p-[2px]'>
                        <div className='w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden'>
                          {activeProfilePhoto || profilePicture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={profilePicture || activeProfilePhoto}
                              alt='Profile'
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <span className='text-white font-medium text-lg'>
                              {name?.[0] || session.user?.email?.[0] || '?'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className='hidden md:block flex-1 max-w-40 truncate text-gray-300 group-hover:text-white transition-colors'>
                      {name || session.user?.email || 'User'}
                    </p>
                  </button>

                  {isMenuOpen && (
                    <div className='absolute z-[999] right-0 mt-2 w-64 rounded-xl shadow-lg bg-gray-800/95 backdrop-blur-sm border border-gray-700/50'>
                      <div className='p-4 border-b border-gray-700/50'>
                        <div className='font-medium text-white truncate'>
                          {name || 'User'}
                        </div>
                        <div className='text-sm text-gray-400 truncate'>
                          {session.user?.email}
                        </div>
                      </div>
                      <div className='py-1'>
                        <Link
                          href='/profile'
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors ${
                            pathname === '/profile' ? 'bg-gray-900' : ''
                          }`}
                        >
                          <div className='flex items-center space-x-3'>
                            <User className='h-5 w-5' />
                            <span>Profile</span>
                          </div>
                          {!isNftMinted && (
                            <AnimatedTooltip
                              position='left'
                              tooltipContent={
                                <div className='max-w-xs text-gray-300'>
                                  <p>
                                    Your account is currently{' '}
                                    <span className='font-semibold text-white'>
                                      unverified
                                    </span>
                                    . Verified accounts enhance your credibility
                                    and trust within the community.
                                  </p>
                                  <p className='mt-2'>
                                    To verify your account, mint your{' '}
                                    <span className='font-semibold text-white'>
                                      Profile NFT
                                    </span>
                                    . This secures your identity and unlocks
                                    exclusive features.
                                  </p>
                                  <Link
                                    href='/profile/nfts'
                                    className='mt-3 inline-block text-primary-500 hover:underline font-medium'
                                  >
                                    Verify your account now →
                                  </Link>
                                </div>
                              }
                            >
                              <BadgeInfo size={18} color='#f55' />
                            </AnimatedTooltip>
                          )}
                        </Link>
                        <div className='md:hidden flex flex-col'>
                          {discover}
                          {liked}
                          {matches}
                          {messages}
                        </div>
                        <button
                          onClick={handleLogout}
                          className='flex items-center space-x-3 w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700/50 transition-colors'
                        >
                          <LogOut className='h-5 w-5' />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className='flex items-center space-x-4'>
                <Link
                  href='/auth/signin'
                  className='text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                >
                  Sign in
                </Link>
                <Link
                  href='/auth/signup'
                  className='bg-gradient-to-r from-primary-500 to-purple-500 text-white hover:opacity-90 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary-500/20'
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
