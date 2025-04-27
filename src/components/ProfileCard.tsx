'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  BadgeCheck,
  Heart,
  MapPin,
  Mars,
  Pointer,
  Transgender,
  User,
  Venus,
  VenusAndMars,
  X,
} from 'lucide-react';
import { AllUsers } from '@/types/user';
import { CardBody, CardContainer, CardItem } from './Card3d';
import { capitalizeFirstLetter } from '@/utils';
import Carousel from './Carousel';
import { useStateContext } from './StateProvider';
import AnimatedTooltip from './AnimatedTooltip';
import { postNudge } from '@/apiCalls';
import { toast } from 'react-toastify';
import { differenceInHours } from 'date-fns';
import { useAppDispatch } from '@/store';
import { updateUserProperty } from '@/store/UsersReducer';

interface ProfileCardProps {
  profile: AllUsers;
  isTopCard: boolean;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  stackIndex: number;
  totalCards: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isTopCard,
  onSwipe,
  stackIndex,
}) => {
  const getShadowStyle = () => {
    if (isTopCard) return 'shadow-2xl';
    if (stackIndex === 1) return 'shadow-xl';
    if (stackIndex === 2) return 'shadow-lg';
    return 'shadow-md';
  };
  const dispatch = useAppDispatch();

  const { userInfo, activeProfilePhoto } = useStateContext();
  const isNftMinted = !!activeProfilePhoto;
  const [nudging, setNudging] = useState(false);

  const loggedInHasWallet = !!userInfo?.walletAddress;
  const currentUserHasWallet = !!profile?.walletAddress;
  const isWalletConnected = loggedInHasWallet && currentUserHasWallet;

  const nudgeDiff = profile.nudgedAt
    ? differenceInHours(new Date(), new Date(profile.nudgedAt))
    : 24;

  const handleNudge = () => {
    if (nudgeDiff < 24) {
      toast.error(
        `You can nudge ${profile?.profile?.firstName} again in ${
          24 - nudgeDiff
        } hours`
      );
      return;
    }
    setNudging(true);
    postNudge(profile.id).then((res) => {
      if (res.status === 'success') {
        toast.success(res.message);
        dispatch(
          updateUserProperty({
            id: profile.id,
            data: {
              nudgedAt: new Date().toISOString(),
            },
          })
        );
      } else {
        toast.error(res.message);
      }
      setNudging(false);
    });
  };

  const maxInterestsToShow = 4;

  const likeBtn = (
    <motion.button
      {...(loggedInHasWallet
        ? {
            whileHover: { scale: 1.1 },
            whileTap: { scale: 0.9 },
          }
        : {})}
      onClick={() => (isWalletConnected ? onSwipe('right') : handleNudge())}
      disabled={!loggedInHasWallet || nudging}
      className='w-16 h-16 rounded-full bg-white/10 hover:enabled:bg-white/20 disabled:opacity-70 flex items-center justify-center'
    >
      {!currentUserHasWallet && loggedInHasWallet ? (
        <Pointer className='h-8 w-8 text-yellow-500' />
      ) : (
        <Heart className='h-8 w-8 text-green-500' />
      )}
    </motion.button>
  );

  const nudgeMessage = `Nudge ${profile?.profile?.firstName} to add a wallet!`;

  return (
    <CardContainer
      containerClassName='h-full'
      className={`inter-var relative rounded-xl border-2 w-full h-full bg-gray-50 dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] ${getShadowStyle()} ${
        !isTopCard ? 'pointer-events-none' : ''
      }`}
    >
      <CardBody className='h-full relative group/card w-full rounded-xl p-6'>
        <CardItem
          translateZ={50}
          className='text-xl z-50 font-bold text-neutral-600 w-full dark:text-white'
        >
          <div className='flex items-center gap-2 w-full'>
            <h2 className='text-2xl font-bold text-white truncate'>
              {capitalizeFirstLetter(profile?.profile?.firstName || '')}{' '}
            </h2>
            <h2 className='text-2xl font-bold text-white truncate'>
              {capitalizeFirstLetter(profile?.profile?.lastName || '')}{' '}
            </h2>
            <div className='shrink-0'>
              {isNftMinted && (
                <AnimatedTooltip tooltipContent='Verified'>
                  <BadgeCheck color='#5f5' />
                </AnimatedTooltip>
              )}
            </div>
          </div>
          <h3 className='flex items-center'>
            {profile?.profile?.age},{' '}
            {profile?.profile?.gender === 'MALE' ? (
              <Mars color='#05f' />
            ) : profile?.profile?.gender === 'FEMALE' ? (
              <Venus color='#f59' />
            ) : profile?.profile?.gender === 'OTHER' ? (
              <Transgender />
            ) : (
              <VenusAndMars />
            )}
          </h3>
        </CardItem>

        <CardItem translateZ='100' className='w-full mt-4 sm:!h-[60%] h-1/2'>
          {profile.files && profile.files.length > 0 ? (
            <Carousel photos={profile.files} />
          ) : (
            <div className='h-full flex items-center justify-center bg-gray-950 rounded-lg'>
              <User className='w-32 h-32 text-gray-400' strokeWidth={1.5} />
            </div>
          )}
        </CardItem>
        <CardItem
          as='div'
          translateZ='60'
          className='text-neutral-500 mt-2 dark:text-neutral-300'
        >
          {profile?.profile?.bio?.length! > 100
            ? `${profile?.profile?.bio?.substring(0, 100)}...`
            : profile?.profile?.bio}
        </CardItem>
        <CardItem
          as='div'
          translateZ='60'
          className='text-neutral-500 mt-2 dark:text-neutral-300'
        >
          <div className='flex flex-wrap gap-2'>
            {(profile?.profile?.interests ?? [])
              .slice(0, maxInterestsToShow)
              .map((interest, index) => (
                <span
                  key={index}
                  className='px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm'
                >
                  {interest}
                </span>
              ))}
            {profile.profile.interests &&
              profile.profile.interests.length > maxInterestsToShow && (
                <span className='px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm'>
                  +{profile.profile.interests?.length - maxInterestsToShow} more
                </span>
              )}
          </div>
        </CardItem>
        {profile?.profile?.city && (
          <div className='flex justify-between items-center mt-4'>
            <CardItem
              translateZ={20}
              className='rounded-xl flex items-center font-normal dark:text-white w-full'
            >
              <MapPin className='h-4 w-4 scale-125 ml-1 shrink-0' />
              <p className='text-gray-300 pl-2 truncate'>
                {profile?.profile?.city}
              </p>
              ,
              <p className='text-gray-300 pl-2 truncate'>
                {profile.profile?.country}
              </p>
            </CardItem>
          </div>
        )}
        {isTopCard && (
          <div className='absolute bottom-6 left-0 right-0 flex justify-center space-x-8'>
            <CardItem translateZ={75} as='div'>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSwipe('left')}
                className='w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center'
              >
                <X className='h-8 w-8 text-red-500' />
              </motion.button>
            </CardItem>
            <CardItem translateZ={75} as='div'>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSwipe('up')}
                className='w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center'
              >
                <ArrowUp className='h-8 w-8 text-blue-500' />
              </motion.button>
            </CardItem>
            <CardItem translateZ={75} as='div'>
              {isWalletConnected ? (
                likeBtn
              ) : (
                <AnimatedTooltip
                  tooltipContent={
                    loggedInHasWallet && !currentUserHasWallet
                      ? nudgeMessage
                      : 'Please add a wallet address to like this profile.'
                  }
                >
                  {likeBtn}
                </AnimatedTooltip>
              )}
            </CardItem>
          </div>
        )}
      </CardBody>
    </CardContainer>
  );
};

export default ProfileCard;
