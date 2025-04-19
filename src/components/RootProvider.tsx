'use client';
// import { SessionProvider, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { FC, ReactNode, useEffect } from 'react';
import ScreenLoader from './ScreenLoader';
import StateProvider from './StateProvider';

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // const { status } = useSession();
  const status: any = 'authenticated'; // Mocking session status for demonstration
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
  <AuthProvider>{children}</AuthProvider>
);

export default RootProvider;
