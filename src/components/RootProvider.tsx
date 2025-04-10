'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { FC, ReactNode, useEffect } from 'react';
import ScreenLoader from './ScreenLoader';
import StateProvider from './StateProvider';

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
  }, [status, router]);

  return status === 'loading' ? (
    <ScreenLoader />
  ) : status === 'unauthenticated' ? (
    children
  ) : (
    <StateProvider>{children}</StateProvider>
  );
};

const RootProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <SessionProvider>
    <AuthProvider>{children}</AuthProvider>
  </SessionProvider>
);

export default RootProvider;
