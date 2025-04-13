'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Heart,
  MapPin,
  Mars,
  Transgender,
  Venus,
  VenusAndMars,
  X,
} from 'lucide-react';
import { ProfileCard as ProfileCardType } from '@/types/user';
import { CardBody, CardContainer, CardItem } from './Card3d';
import { capitalizeFirstLetter } from '@/utils';
import Carousel from './Carousel';

interface ProfileCardProps {
  profile: ProfileCardType;
  isTopCard: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  stackIndex: number;
  totalCards: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isTopCard,
  onSwipe,
  stackIndex,
  totalCards,
}) => {
  const getShadowStyle = () => {
    if (isTopCard) return 'shadow-2xl';
    if (stackIndex === 1) return 'shadow-xl';
    if (stackIndex === 2) return 'shadow-lg';
    return 'shadow-md';
  };

  return (
    <CardContainer
      containerClassName='h-full'
      className={`inter-var relative rounded-xl border-2 w-full h-full bg-gray-50 dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] ${getShadowStyle()} ${
        !isTopCard ? 'pointer-events-none' : ''
      }`}
    >
      <CardBody className='h-full relative group/card w-full rounded-xl p-6'>
        <CardItem
          translateZ='50'
          className='text-xl font-bold text-neutral-600 dark:text-white'
        >
          <h2 className='text-2xl font-bold text-white flex items-center gap-5'>
            {capitalizeFirstLetter(profile.firstName)}{' '}
            {capitalizeFirstLetter(profile.lastName)}{' '}
            <BadgeCheck color='#5f5' />
          </h2>
          <h3 className='flex items-center'>
            {profile.age},{' '}
            {profile.gender === 'MALE' ? (
              <Mars color='#05f' />
            ) : profile.gender === 'FEMALE' ? (
              <Venus color='#f59' />
            ) : profile.gender === 'OTHER' ? (
              <Transgender />
            ) : (
              <VenusAndMars />
            )}
          </h3>
        </CardItem>

        <CardItem translateZ='100' className='w-full mt-4 sm:!h-[60%] h-1/2'>
          <Carousel photos={profile.photos} />
        </CardItem>
        <CardItem
          as='div'
          translateZ='60'
          className='text-neutral-500 mt-2 dark:text-neutral-300'
        >
          <p className='text-gray-300 mb-4'>{profile.bio}</p>
        </CardItem>
        <CardItem
          as='div'
          translateZ='60'
          className='text-neutral-500 mt-2 dark:text-neutral-300'
        >
          <div className='flex flex-wrap gap-2'>
            {profile.interests.map((interest, index) => (
              <span
                key={index}
                className='px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm'
              >
                {interest}
              </span>
            ))}
          </div>
        </CardItem>
        <div className='flex justify-between items-center mt-4'>
          <CardItem
            translateZ={20}
            className='rounded-xl flex items-center gap-2 font-normal dark:text-white'
          >
            <MapPin className='h-4 w-4 scale-125 ml-1' />
            <span className='text-gray-300'>
              {profile.city} <small>({profile.maxDistance} km away)</small>
            </span>
          </CardItem>
        </div>
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
                onClick={() => onSwipe('right')}
                className='w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center'
              >
                <Heart className='h-8 w-8 text-green-500' />
              </motion.button>
            </CardItem>
          </div>
        )}
      </CardBody>
    </CardContainer>
  );
};

export default ProfileCard;
