'use client';
import InfiniteScroll from '@/components/InfiniteScroll';
import Loader from '@/components/Loader';
import { useStateContext } from '@/components/StateProvider';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUserNfts } from '@/store/thunk';
import { getImageFromNFT } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

const NftView: FC<{ nftUri: string }> = ({ nftUri }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    getImageFromNFT(nftUri).then((res) => {
      if (res) {
        setUrl(res);
      }
    });
  }, [nftUri]);

  return url ? (
    <img src={url} alt={`NFT ${nftUri}`} className='w-full h-48 object-cover' />
  ) : (
    <></>
  );
};

const UserNftPage = () => {
  const params = useParams();
  const userId = params.id as string;
  const { nfts } = useAppSelector('user');
  const { data: photos, loading, hasMore, pageNo } = nfts;
  const dispatch = useAppDispatch();
  const { userInfo } = useStateContext();

  const router = useRouter();

  useEffect(() => {
    if (!userInfo?.isVerified) {
      router.push(`/user/${userId}`);
    }
  }, [userInfo?.isVerified, userId]);

  useEffect(() => {
    if (!loading && photos.length === 0 && hasMore) {
      dispatch(fetchUserNfts({ id: userId, pageNo: 1, pageSize: 10 }));
    }
  }, [photos, loading, userId, hasMore]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchUserNfts({ id: userId, pageNo, pageSize: 10 }));
    }
  };

  if (loading && !photos) {
    return (
      <div className='flex items-center h-full justify-center'>
        <Loader />
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-gray-400'>No photos available for this user.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='max-w-5xl px-3 mx-auto'
    >
      <h1 className='text-2xl font-bold text-white mb-6'>User Nfts</h1>

      <AnimatePresence>
        {photos.length > 0 ? (
          <InfiniteScroll
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoading={loading}
            direction='top-to-bottom'
            className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[600px]'
          >
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                className='relative group overflow-hidden rounded-lg shadow-lg'
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <NftView nftUri={photo.tokenUri} />
                <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300'>
                  <p className='text-white text-sm'>
                    Minted on {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </InfiniteScroll>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='text-center text-gray-500 dark:text-gray-400'
          >
            No notifications to show.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserNftPage;
