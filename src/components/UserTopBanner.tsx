import { useAppDispatch, useAppSelector } from '@/store';
import {
  AlertCircle,
  BadgeCheck,
  Heart,
  HeartPulse,
  Mars,
  MessageCircle,
  Transgender,
  Venus,
  VenusAndMars,
} from 'lucide-react';
import React, { useState } from 'react';
import TransactionWrapper from './TransactionWrapper';
import { motion } from 'framer-motion';
import { useEthereum, useMatchMakingContract } from './EthereumProvider';
import { likeProfile } from '@/contract';
import { toast } from 'react-toastify';
import { formatDistanceToNowStrict } from 'date-fns';
import { useStateContext } from './StateProvider';
import AnimatedTooltip from './AnimatedTooltip';
import { capitalizeFirstLetter } from '@/utils';
import Link from 'next/link';
import { getUserById } from '@/apiCalls';
import { useParams } from 'next/navigation';
import { setUserData, setUserLoading } from '@/store/UserReducer';

const UserTopBanner = () => {
  const {
    user: { data: userData },
  } = useAppSelector('user');
  const matchMakingContract = useMatchMakingContract();
  const { provider, connectedAddress } = useEthereum();
  const { userInfo } = useStateContext();
  const params = useParams();
  const userId = params.id as string;
  const dispatch = useAppDispatch();
  const [isLiking, setIsLiking] = useState(false);

  const [h1Height, setH1Height] = useState(0);

  const handleLike = async () => {
    try {
      setIsLiking(true);
      const balance = await provider?.getBalance(connectedAddress!);
      console.log('Wallet balance (in wei):', balance, balance!.toString());

      // Get the required amount for the transaction
      const amount = await matchMakingContract?.s_amount();
      console.log('Required amount (in wei):', amount, amount.toString());

      // Ensure the wallet has enough balance
      if ((balance ?? 0) < amount) {
        toast.error(
          'Insufficient funds to like the profile. Please add more funds to your wallet.'
        );
        setIsLiking(false);
        return null;
      }

      await likeProfile(matchMakingContract, userData!.walletAddress!);

      toast.success('Profile liked successfully! 💝');

      setTimeout(() => {
        getUserById(userId as string)
          .then((res) => {
            if (res.status === 'success') {
              dispatch(setUserData(res.data!));
            }
          })
          .catch((err) => {
            console.log('Error fetching user data:', err);
          })
          .finally(() => {
            dispatch(setUserLoading(false));
            setIsLiking(false);
          });
      }, 2000);

      return true;
    } catch (error: unknown) {
      console.log('Error liking profile:', error);
      return false;
    }
  };

  if (!userData) {
    return <></>;
  }

  return (
    <div
      className={
        'relative flex bg-gradient-to-r from-purple-600 to-blue-500 h-32 rounded-t-lg pt-16 overflow-visible shadow-[0_10px_30px_-5px_rgba(128,90,213,0.5),0_4px_6px_-2px_rgba(56,189,248,0.3)]'
      }
    >
      <div className='flex items-start gap-4 mx-6 w-full'>
        <div className='w-24 h-24 rounded-full border-4 border-gray-900 shrink-0 overflow-hidden'>
          {userData?.profile.profilePicture ? (
            <img
              src={userData.profile.profilePicture}
              alt='Profile Picture'
              className='object-cover w-full h-full'
            />
          ) : (
            <p className='w-full h-full flex items-center justify-center text-5xl font-bold text-gray-200 bg-gray-800 rounded-full'>
              {userData.profile.firstName?.[0]?.toUpperCase()}
              {userData.profile.lastName?.[0]?.toUpperCase()}
            </p>
          )}
        </div>
        <div className={`flex-1 ${h1Height < 40 ? 'pt-8' : ''} `}>
          <h1
            ref={(e) => {
              const rect = e?.getBoundingClientRect();
              if (rect) {
                setH1Height(rect.height);
              }
            }}
            className='text-2xl font-bold text-white'
          >
            {userData.profile.firstName} {userData.profile.lastName}
          </h1>
          <div className='flex items-center justify-between min-h-14'>
            <div className='flex flex-col gap-2'>
              {!!userData.profile.city && (
                <div className='flex items-center gap-2 text-gray-300'>
                  {userData.profile.city}, {userData.profile.country}
                </div>
              )}
              <h3 className='flex items-center gap-2'>
                <p>{userData?.profile?.age} years old,</p>
                <AnimatedTooltip
                  tooltipContent={capitalizeFirstLetter(
                    userData?.profile?.gender ?? ''
                  )}
                >
                  {userData?.profile?.gender === 'MALE' ? (
                    <Mars color='#05f' />
                  ) : userData?.profile?.gender === 'FEMALE' ? (
                    <Venus color='#f59' />
                  ) : userData?.profile?.gender === 'OTHER' ? (
                    <Transgender />
                  ) : (
                    <VenusAndMars />
                  )}
                </AnimatedTooltip>
                <AnimatedTooltip
                  tooltipContent={capitalizeFirstLetter(
                    userData?.profile?.sexualOrientation ?? ''
                  )}
                >
                  <HeartPulse color='#CF29DE' />
                </AnimatedTooltip>
              </h3>
            </div>

            <div className='flex justify-end shrink-0'>
              {userData.likedAt ? (
                <div className='flex items-center flex-col gap-2 text-gray-400'>
                  <span className='text-sm text-gray-400'>
                    Liked{' '}
                    {formatDistanceToNowStrict(new Date(userData.likedAt))} ago
                  </span>
                  {userData.matchedAt ? (
                    userData.chatRoomId ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          href={`/chat/${userData.chatRoomId}`}
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
                    <></>
                  )}
                </div>
              ) : (
                <TransactionWrapper
                  position='left'
                  tooltipContent={{
                    default: userData.likedAt
                      ? `You have already liked this profile ${formatDistanceToNowStrict(
                          userData.likedAt,
                          { addSuffix: true }
                        )}.`
                      : `Click to like this profile.`,
                  }}
                  content={(disabled) => (
                    <motion.button
                      {...(disabled
                        ? {
                            whileHover: { scale: 1.1 },
                            whileTap: { scale: 0.9 },
                          }
                        : {})}
                      onClick={handleLike}
                      disabled={
                        disabled ||
                        !!userData.likedAt ||
                        !userInfo?.walletAddress ||
                        !userData.walletAddress ||
                        isLiking
                      }
                      className={
                        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    >
                      <Heart size={18} />
                      Like
                    </motion.button>
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='absolute top-4 right-4'>
        {userData.isVerified ? (
          <div className='flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full'>
            <BadgeCheck size={18} />
            <span className='text-sm font-medium'>Verified</span>
          </div>
        ) : (
          <div className='flex items-center gap-2 bg-yellow-500 text-white px-3 py-1 rounded-full'>
            <AlertCircle size={18} />
            <span className='text-sm font-medium'>Unverified</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTopBanner;
