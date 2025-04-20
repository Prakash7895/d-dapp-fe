'use client';
import { usePathname, useRouter } from 'next/navigation';
import { FC, ReactNode, useEffect } from 'react';
import ScreenLoader from './ScreenLoader';
import StateProvider from './StateProvider';
import useSession from '@/hooks/useSession';

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { status } = useSession();
  console.log('status', status);
  const router = useRouter();
  const pathname = usePathname();
  console.log('pathname', pathname);

  const isAuthRoute = pathname.startsWith('/auth/sign');

  useEffect(() => {
    if (status === 'unauthenticated' && !isAuthRoute) {
      router.replace('/auth/signin');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, isAuthRoute]);

  return status === 'loading' ? (
    <ScreenLoader />
  ) : status === 'unauthenticated' ? (
    children
  ) : (
    <StateProvider>{children}</StateProvider>
  );
};

const RootProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

export default RootProvider;
