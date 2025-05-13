import axiosInstance from '@/apiCalls';
import { SessionResponse } from '@/types/user';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Cache storage outside the component to persist between renders
let lastValidationTime: number | null = null;
let cachedSessionData: SessionResponse | null = null;
const VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

const useSession = (): {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  data: SessionResponse;
  clearSession: () => void;
  fetchSession: () => Promise<void>;
} => {
  const [status, setStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading');
  const [data, setData] = useState<SessionResponse>({
    expires: new Date(),
    user: null,
  });
  const router = useRouter();
  const pathName = usePathname();

  const isAuthRoute = pathName.startsWith('/auth');
  const isAdminRoute = pathName.startsWith('/admin');

  const clearSession = useCallback(() => {
    lastValidationTime = Date.now();
    cachedSessionData = { expires: new Date(), user: null };
    setStatus('unauthenticated');
  }, []);

  const fetchSession = useCallback(async () => {
    const currentTime = Date.now();
    const res = await axiosInstance.get('/auth/validate');

    lastValidationTime = currentTime;
    cachedSessionData = res.data?.data;

    if (res.data?.data?.user?.userId) {
      setStatus('authenticated');
      setData(res.data?.data);
      if (isAuthRoute) {
        router.replace('/');
      }
    } else {
      setStatus('unauthenticated');
      if (!isAuthRoute && !isAdminRoute) {
        router.replace('/auth/signin');
      }
    }
  }, [router]);

  useEffect(() => {
    const validateSession = async () => {
      const currentTime = Date.now();

      // Return cached data if it's still valid
      if (
        lastValidationTime &&
        cachedSessionData &&
        currentTime - lastValidationTime < VALIDATION_INTERVAL
      ) {
        setStatus(cachedSessionData.user ? 'authenticated' : 'unauthenticated');
        setData(cachedSessionData);

        if (!cachedSessionData.user && !isAuthRoute && !isAdminRoute) {
          router.replace('/auth/signin');
        } else if (cachedSessionData.user && isAuthRoute) {
          router.replace('/');
        }
        return;
      }

      try {
        const accessToken = sessionStorage.getItem('accessToken');

        if (!accessToken) {
          setStatus('unauthenticated');
          if (!isAuthRoute && !isAdminRoute) {
            router.replace('/auth/signin');
          }
          return;
        }
        fetchSession();
      } catch (err: unknown) {
        console.log('Error validating session:', err);
        lastValidationTime = currentTime;
        cachedSessionData = { expires: new Date(), user: null };
        setStatus('unauthenticated');
        if (!isAuthRoute && !isAdminRoute) {
          router.replace('/auth/signin');
        }
      }
    };

    validateSession();
  }, [router, pathName, fetchSession]);

  return {
    status,
    data,
    clearSession,
    fetchSession,
  };
};

export default useSession;
