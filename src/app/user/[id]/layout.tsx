'use client';
import React, { ReactNode, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import Loader from '@/components/Loader';
import { Tabs } from '@/components/Tabs';
import UserTopBanner from '@/components/UserTopBanner';
import { setUserData, setUserLoading } from '@/store/UserReducer';
import { getUserById } from '@/apiCalls';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useStateContext } from '@/components/StateProvider';

const UserLayoutPage = ({ children }: { children: ReactNode }) => {
  const params = useParams();
  const userId = params.id;

  const {
    user: { data: userData, loading },
  } = useAppSelector('user');
  const dispatch = useAppDispatch();
  const { userInfo } = useStateContext();

  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (userId && !loading) {
      dispatch(setUserLoading(true));
      getUserById(userId as string)
        .then((res) => {
          if (res.status === 'success') {
            dispatch(setUserData(res.data!));
          }
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
        })
        .finally(() => {
          dispatch(setUserLoading(false));
        });
    }
  }, [userId]);

  const isVerified = userInfo?.isVerified;

  const renderTabTitle = (title: string) =>
    isVerified ? (
      title
    ) : (
      <span className='flex items-center gap-2'>
        {title} <Lock size={14} />
      </span>
    );

  const tooltipContent = (
    <div className='text-sm text-gray-300'>
      <p>{"Verify your account to view this user's photos."}</p>
      <p>
        To verify, mint your Profile NFT in the{' '}
        <Link
          href='/profile/nfts'
          prefetch
          onClick={(e) => e.stopPropagation()}
          className='text-blue-500 underline hover:text-blue-400'
        >
          Profile Section
        </Link>
        .
      </p>
    </div>
  );

  const tabs = [
    {
      title: 'About',
      value: 'about',
      path: `/user/${userId}`,
    },
    {
      title: renderTabTitle('Photos'),
      value: 'photos',
      path: `/user/${userId}/photos`,
      disabled: !isVerified,
      tooltipContent: !isVerified ? tooltipContent : null,
    },
    {
      title: renderTabTitle('NFTs'),
      value: 'nfts',
      path: `/user/${userId}/nfts`,
      disabled: !isVerified,
      tooltipContent: !isVerified ? tooltipContent : null,
    },
  ];

  const activeTabValue = useMemo(
    () => tabs.find((el) => el.path === pathName)?.value,
    [pathName]
  );

  if (loading) {
    return (
      <div className='flex items-center h-full justify-center'>
        <Loader />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className='flex items-center h-full justify-center'>
        <p className='text-gray-400'>User not found</p>
      </div>
    );
  }

  return (
    <div className='bg-gray-900 p-8 h-full'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden'
      >
        <UserTopBanner />
        <div className='mx-6 mt-24 mb-10'>
          <Tabs
            tabs={tabs.map((el) => ({
              title: el.title,
              value: el.value,
              disabled: el.disabled,
              tooltipContent: el.tooltipContent,
              onClick: () => {
                router.push(el.path);
              },
            }))}
            containerClassName='mb-7'
            activeTabValue={activeTabValue}
            key={activeTabValue}
            activeTabClassName='!bg-primary-500/60'
          />
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default UserLayoutPage;
