'use client';
import { getLikedUsers } from '@/apiCalls';
import React, { useEffect, useState } from 'react';
import { LikdedUser } from '@/types/user';
import { motion } from 'framer-motion';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import {
  Heart,
  MapPin,
  Mars,
  MessageCircle,
  User,
  Venus,
  X,
} from 'lucide-react';
import { capitalizeFirstLetter } from '@/utils';
import { useMatchMakingContract } from '@/components/EthereumProvider';
import TransactionWrapper from '@/components/TransactionWrapper';
import ScreenLoader from '@/components/ScreenLoader';
import { useStateContext } from '@/components/StateProvider';
import { unlikeProfile } from '@/contract';
import Link from 'next/link';

const LikedPage = () => {
  const [users, setUsers] = useState<LikdedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [likeExpirationMinutes, setLikeExpirationMinutes] = useState(0);

  const matchMakingContract = useMatchMakingContract();
  const { userInfo } = useStateContext();

  useEffect(() => {
    fetchLikedUsers();
  }, []);

  useEffect(() => {
    async function fetchLikeExpirationDays() {
      if (matchMakingContract) {
        const minutes = await matchMakingContract?.s_likeExpirationDays();
        setLikeExpirationMinutes(Number(minutes));
      }
    }
    fetchLikeExpirationDays();
  }, [matchMakingContract]);

  const fetchLikedUsers = async () => {
    const response = await getLikedUsers(1, 10);
    console.log('response', response);
    if (response.status === 'success' && response.data) {
      setUsers(response.data.users);
      setTotal(response.data.total);
    }
    setLoading(false);
  };

  const handleUnlike = async (otherUserAddress: string) => {
    const currentUserAddress = userInfo?.walletAddress!;
    if (!currentUserAddress || !otherUserAddress) {
      console.log('Wallet addresses not connected');
      return;
    }

    await unlikeProfile(
      matchMakingContract,
      currentUserAddress,
      otherUserAddress
    );
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-900'>
        <ScreenLoader />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 p-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-7xl mx-auto'
      >
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-3xl font-bold text-white'>Liked Profiles</h1>
          <span className='text-gray-400'>Total: {total}</span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {users.map((user) => {
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
                {/* Profile Image */}
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

                  {/* Liked Indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='absolute top-4 right-4'
                  >
                    <Heart className='w-6 h-6 text-primary-500 fill-primary-500' />
                  </motion.div>
                </div>

                {/* User Info */}
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

                  {/* Interests */}
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

                  {/* Liked Time & Unlike Button */}
                  <div className='flex items-center justify-between pt-3 border-t border-gray-700'>
                    <span className='text-sm text-gray-400'>
                      Liked{' '}
                      {formatDistanceToNowStrict(new Date(user.likedAt || ''))}{' '}
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
                              onClick={() => handleUnlike(user.walletAddress!)}
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
        </div>

        {users.length === 0 && (
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
      </motion.div>
    </div>
  );
};

export default LikedPage;
