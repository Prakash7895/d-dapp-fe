'use client';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import {
  Heart,
  MapPin,
  Mars,
  MessageCircle,
  SquareArrowOutUpRight,
  User,
  Venus,
  X,
} from 'lucide-react';
import { capitalizeFirstLetter } from '@/utils';
import { useMatchMakingContract } from '@/components/EthereumProvider';
import TransactionWrapper from '@/components/TransactionWrapper';

import { useStateContext } from '@/components/StateProvider';
import { unlikeProfile } from '@/contract';
import Link from 'next/link';
import InfiniteScroll from '@/components/InfiniteScroll';
import { fetchLikedUsers } from '@/store/thunk';
import { useAppDispatch, useAppSelector } from '@/store';
import Loader from '@/components/Loader';
import useRemainingHeight from '@/hooks/useRemainingHeight';
import { resetLikedUsers } from '@/store/LikedReducer';

const LikedPage = () => {
  const [likeExpirationMinutes, setLikeExpirationMinutes] = useState(0);
  const { data, hasMore, loading, pageNo, total } = useAppSelector('liked');
  const dispatch = useAppDispatch();

  const matchMakingContract = useMatchMakingContract();
  const { userInfo } = useStateContext();

  useEffect(() => {
    async function fetchLikeExpirationDays() {
      if (matchMakingContract) {
        const minutes = await matchMakingContract?.s_likeExpMinutes();
        setLikeExpirationMinutes(Number(minutes));
      }
    }
    fetchLikeExpirationDays();
  }, [matchMakingContract]);

  const handleUnlike = async (otherUserAddress: string) => {
    const currentUserAddress = userInfo!.walletAddress;
    if (!currentUserAddress || !otherUserAddress) {
      return;
    }

    await unlikeProfile(matchMakingContract, otherUserAddress);
  };

  useEffect(() => {
    if (!loading && data.length === 0 && hasMore) {
      dispatch(fetchLikedUsers({ pageNo: 1, pageSize: 20 }));
    }
  }, [data, loading, hasMore]);

  useEffect(() => {
    return () => {
      dispatch(resetLikedUsers());
    };
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchLikedUsers({ pageNo, pageSize: 20 }));
    }
  };

  const height = useRemainingHeight();

  if (loading && (!data || data.length === 0)) {
    return (
      <div className='flex items-center h-full justify-center'>
        <Loader />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='max-w-5xl p-3 mx-auto'
    >
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold text-white'>Liked Profiles</h1>
        <span className='text-gray-400'>Total: {total}</span>
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
              maxHeight: `calc(${height}px - 5.75rem)`,
            }}
          >
            {data.map((user) => {
              const diffInSeconds = differenceInSeconds(
                new Date(),
                new Date(user.likedAt || '')
              );

              const likeExpirationSeconds = likeExpirationMinutes * 60;

              const canUnlike =
                likeExpirationSeconds > 0 &&
                diffInSeconds > likeExpirationSeconds;

              const canLikeIn = formatDistanceToNowStrict(
                new Date(
                  new Date(user.likedAt || '').getTime() +
                    likeExpirationSeconds * 1000
                ),
                {
                  addSuffix: true,
                }
              );

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className='bg-gray-800 rounded-xl p-6 relative group w-full'
                >
                  <Link href={`/user/${user.id}`}>
                    <div className='relative w-full h-48 mb-4 rounded-lg overflow-hidden'>
                      {user.files && user.files.length > 0 ? (
                        <img
                          src={user.profile.profilePicture || user.files[0]}
                          alt={`${user.profile.firstName}'s profile`}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full bg-gray-700 flex items-center justify-center'>
                          <User className='w-16 h-16 text-gray-500' />
                        </div>
                      )}

                      <div className='absolute top-4 flex items-center justify-end w-full px-4 gap-4'>
                        <SquareArrowOutUpRight
                          size={20}
                          className='text-blue-300'
                        />

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Heart className='w-6 h-6 text-primary-500 fill-primary-500 cursor-default' />
                        </motion.div>
                      </div>
                    </div>
                  </Link>

                  <div className='space-y-2'>
                    <div className='flex flex-col gap-1 items-center justify-between'>
                      <h3 className='text-xl font-semibold text-white gap-2 w-full truncate'>
                        {capitalizeFirstLetter(user.profile.firstName || '')}{' '}
                        {capitalizeFirstLetter(user.profile.lastName || '')}
                      </h3>
                      <div className='flex items-center justify-start gap-2 mr-auto'>
                        {user.profile.gender === 'MALE' ? (
                          <Mars className='w-5 h-5 text-blue-400' />
                        ) : (
                          <Venus className='w-5 h-5 text-pink-400' />
                        )}
                        <span className='text-gray-400'>
                          {user.profile.age} y/o
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center text-gray-400 text-sm'>
                      <MapPin className='w-4 h-4 mr-1 shrink-0' />
                      {user.profile.city && (
                        <span className='truncate'>
                          {capitalizeFirstLetter(user.profile.city)},{' '}
                          {capitalizeFirstLetter(user.profile.country || '')}
                        </span>
                      )}
                    </div>

                    {user.profile.bio && (
                      <p className='text-gray-300 text-sm line-clamp-2'>
                        {user.profile.bio}
                      </p>
                    )}

                    <div className='flex flex-wrap gap-2 items-center !mb-3'>
                      {user.profile.interests
                        ?.slice(0, 3)
                        .map((interest, idx) => (
                          <span
                            key={idx}
                            className='px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs'
                          >
                            {interest}
                          </span>
                        ))}
                      {(user.profile.interests?.length || 0) > 3 && (
                        <span className='px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs'>
                          +{user.profile.interests!.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className='flex items-center justify-between pt-3 border-t border-gray-700'>
                      <span className='text-sm text-gray-400'>
                        Liked{' '}
                        {formatDistanceToNowStrict(
                          new Date(user.likedAt || '')
                        )}{' '}
                        ago
                      </span>
                      {user.isMatched ? (
                        user.chatRoomId ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              href={`/chat/${user.chatRoomId}`}
                              prefetch
                              className='flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-full text-sm hover:bg-primary-600 transition-colors'
                            >
                              <MessageCircle className='w-4 h-4' />
                              Message
                            </Link>
                          </motion.button>
                        ) : (
                          <></>
                        )
                      ) : (
                        <TransactionWrapper
                          disabled={!matchMakingContract || !canUnlike}
                          position='left'
                          tooltipContent={
                            canUnlike
                              ? {
                                  default: (
                                    <div className='max-w-60'>
                                      Click to unlike this profile. Your like
                                      amount will be refunded to the wallet used
                                      for liking this profile.
                                    </div>
                                  ),
                                }
                              : {
                                  default: (
                                    <div className='max-w-60'>
                                      You can unlike this profile {canLikeIn}.
                                      Your like amount will be refunded to the
                                      wallet used for liking this profile.
                                    </div>
                                  ),
                                }
                          }
                          content={(disabled) => {
                            const isDisabled =
                              disabled || !matchMakingContract || !canUnlike;

                            return (
                              <motion.button
                                {...(!isDisabled
                                  ? {
                                      whileHover: { scale: 1.05 },
                                      whileTap: { scale: 0.95 },
                                    }
                                  : {})}
                                onClick={() =>
                                  handleUnlike(user.walletAddress!)
                                }
                                disabled={isDisabled}
                                className='flex items-center gap-1 px-3 py-1 disabled:opacity-75 disabled:pointer-events-none bg-red-500/10 text-red-400 rounded-full text-sm hover:enabled:bg-red-500/20 transition-colors'
                              >
                                <X className='w-4 h-4' />
                                Unlike
                              </motion.button>
                            );
                          }}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </InfiniteScroll>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-16'
          >
            <Heart className='w-16 h-16 text-gray-600 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-white mb-2'>
              No Liked Profiles Yet
            </h3>
            <p className='text-gray-400'>
              Start exploring and like profiles that interest you
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LikedPage;
