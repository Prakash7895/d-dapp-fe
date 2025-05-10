'use client';
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Wallet } from 'lucide-react';
import UserMatchCard from '@/components/UserMatchCard';
import { useStateContext } from '@/components/StateProvider';
import AnimatedTooltip from '@/components/AnimatedTooltip';
import InfiniteScroll from '@/components/InfiniteScroll';
import { useAppDispatch, useAppSelector } from '@/store';
import useRemainingHeight from '@/hooks/useRemainingHeight';
import Loader from '@/components/Loader';
import { fetchMatchedUsers } from '@/store/thunk';

const MatchesPage = () => {
  const { totalBalance, getMulitSigBalances } = useStateContext();
  const { data, hasMore, loading, pageNo, total } = useAppSelector('matches');
  const dispatch = useAppDispatch();

  useEffect(() => {
    getMulitSigBalances();
  }, []);

  useEffect(() => {
    if (!loading && data.length === 0 && hasMore) {
      dispatch(fetchMatchedUsers({ pageNo: 1, pageSize: 20 }));
    }
  }, [data, loading, hasMore]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchMatchedUsers({ pageNo, pageSize: 20 }));
    }
  };

  const height = useRemainingHeight();

  if (loading && !data) {
    return (
      <div className='flex items-center h-full justify-center'>
        <Loader />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className='max-w-5xl p-3 mx-auto'
    >
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold text-white'>Your Matches</h1>
        <div className='flex items-center gap-6'>
          {!!totalBalance && (
            <AnimatedTooltip tooltipContent='Total ETH Balance in all Multisig wallets'>
              <div className='flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg'>
                <Wallet className='text-primary-500 w-5 h-5' />
                <span className='text-white font-medium'>
                  {totalBalance || 0} ETH
                </span>
              </div>
            </AnimatedTooltip>
          )}
          <div className='flex items-center gap-2'>
            <Heart className='text-primary-500 w-6 h-6' />
            <span className='text-gray-400'>{total} matches</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {data.length > 0 ? (
          <InfiniteScroll
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoading={loading}
            direction='top-to-bottom'
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2`}
            style={{
              maxHeight: `calc(${height}px - 6rem)`,
            }}
          >
            {data.map((match) => (
              <UserMatchCard key={match.id} {...match} />
            ))}
          </InfiniteScroll>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-16'
          >
            <Heart className='w-16 h-16 text-gray-600 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-white mb-2'>
              No Matches Yet
            </h3>
            <p className='text-gray-400'>
              Keep exploring to find your perfect match!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MatchesPage;
