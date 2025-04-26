'use client';
import { usePathname, useRouter } from 'next/navigation';
import { FC, ReactNode, useEffect } from 'react';
import ScreenLoader from './ScreenLoader';
import StateProvider from './StateProvider';
import useSession from '@/hooks/useSession';
import EthereumProvider from './EthereumProvider';
import { ToastContainer } from 'react-toastify';
import ChatProvider from './Chat/ChatProvider';
import { Provider } from 'react-redux';
import { store } from '@/store';

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { status } = useSession();

  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = pathname.startsWith('/auth/sign');
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (status === 'unauthenticated' && !isAuthRoute && !isAdminRoute) {
      router.replace('/auth/signin');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, isAuthRoute, isAdminRoute]);

  return status === 'loading' ? (
    <ScreenLoader />
  ) : status === 'unauthenticated' ? (
    children
  ) : (
    <Provider store={store}>
      <StateProvider>
        <ChatProvider>{children}</ChatProvider>
      </StateProvider>
    </Provider>
  );
};

const RootProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <EthereumProvider>
    <ToastContainer />
    <AuthProvider>{children}</AuthProvider>
  </EthereumProvider>
);

export default RootProvider;
