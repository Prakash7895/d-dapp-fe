import axiosInstance from '@/apiCalls';
import { SessionResponse } from '@/types/user';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Cache storage outside the component to persist between renders
let lastValidationTime: number | null = null;
let cachedSessionData: SessionResponse | null = null;
const VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

const useSession = (): {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  data: SessionResponse;
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

  const isAuthRoute = pathName.startsWith('/auth/sign');
  const isAdminRoute = pathName.startsWith('/admin');

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
      } catch (err: any) {
        lastValidationTime = currentTime;
        cachedSessionData = { expires: new Date(), user: null };
        setStatus('unauthenticated');
        if (!isAuthRoute && !isAdminRoute) {
          router.replace('/auth/signin');
        }
      }
    };

    validateSession();
  }, [router, pathName]);

  return {
    status,
    data,
  };
};

export default useSession;
