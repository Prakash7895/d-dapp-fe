import axiosInstance from '@/apiCalls';
import { SessionResponse } from '@/types/user';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    setStatus('loading');
    axiosInstance.get('/auth/validate').then((res) => {
      if (res.data?.data?.user?.userId) {
        setStatus('authenticated');
        setData(res.data?.data?.user);
        if (isAuthRoute) {
          router.replace('/');
        }
      } else {
        setStatus('unauthenticated');
        if (!isAuthRoute) {
          router.replace('/auth/signin');
        }
      }
    });
  }, [router, pathName]);

  return {
    status,
    data,
  };
};

export default useSession;
