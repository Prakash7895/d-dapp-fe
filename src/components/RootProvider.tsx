'use client';
import { usePathname, useRouter } from 'next/navigation';
import { FC, ReactNode, useEffect } from 'react';
import ScreenLoader from './ScreenLoader';
import StateProvider from './StateProvider';
import useSession from '@/hooks/useSession';
import { ToastContainer } from 'react-toastify';
import ChatProvider from './Chat/ChatProvider';
import { Provider } from 'react-redux';
import { store } from '@/store';
import dynamic from 'next/dynamic';

const EthereumProvider = dynamic(() => import('./EthereumProvider'), {
  ssr: false,
});

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { status } = useSession();

  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = pathname.startsWith('/auth');
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
    isAuthRoute || isAdminRoute ? (
      children
    ) : (
      <ScreenLoader />
    )
  ) : (
    <Provider store={store}>
      <StateProvider>
        <ChatProvider>{children}</ChatProvider>
      </StateProvider>
    </Provider>
  );
};

const RootProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <>
    <ToastContainer
      position='top-right'
      theme='dark'
      toastStyle={{
        backgroundColor: '#1f2937',
        color: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '16px',
      }}
    />
    <EthereumProvider>
      <AuthProvider>{children}</AuthProvider>
    </EthereumProvider>
  </>
);

export default RootProvider;
