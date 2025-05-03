'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AllUsers } from '@/types/user';
import ProfileCardComponent from './ProfileCard';

interface CardStackProps {
  profiles: AllUsers[];
  onSwipe: (
    direction: 'left' | 'right' | 'up',
    profile: AllUsers
  ) => Promise<boolean | undefined>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

const CardStack: React.FC<CardStackProps> = ({
  profiles,
  onSwipe,
  currentIndex,
  setCurrentIndex,
}) => {
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const xTouchStart = useRef<number | null>(null);
  const xTouchEnd = useRef<number | null>(null);
  const yTouchStart = useRef<number | null>(null);
  const yTouchEnd = useRef<number | null>(null);

  const visibleCards = profiles.slice(currentIndex, currentIndex + 4);

  const handleSwipe = async (dir: 'left' | 'right' | 'up') => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    try {
      const success = await onSwipe(dir, profiles[currentIndex]);

      if (success) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setDirection(null);
          setIsAnimating(false);
        }, 500);
      } else {
        setDirection(null);
        setIsAnimating(false);
      }
    } catch (error) {
      // Reset the card if there was an error
      console.log('Swipe error:', error);
      setDirection(null);
      setIsAnimating(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    xTouchStart.current = e.touches[0].clientX;
    yTouchStart.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    xTouchEnd.current = e.touches[0].clientX;
    yTouchEnd.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!xTouchStart.current || !xTouchEnd.current) return;
    if (!yTouchStart.current || !yTouchEnd.current) return;

    const distanceY = yTouchStart.current - yTouchEnd.current;
    const isUpSwipe = distanceY > 50;

    const distanceX = xTouchStart.current - xTouchEnd.current;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;

    if (Math.abs(distanceY) > Math.abs(distanceX) && isUpSwipe) {
      handleSwipe('up');
    } else if (isLeftSwipe) {
      handleSwipe('left');
    } else if (isRightSwipe) {
      handleSwipe('right');
    }

    xTouchStart.current = null;
    xTouchEnd.current = null;
    yTouchStart.current = null;
    yTouchEnd.current = null;
  };

  if (currentIndex >= profiles.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='relative w-[85%] max-w-[500px] h-[85%] max-h-[800px] flex items-center justify-center'
      >
        <div className='text-center p-8 rounded-xl bg-gray-900/50 backdrop-blur-sm'>
          <motion.h2
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className='text-3xl font-bold text-white mb-4'
          >
            {"That's all for now!"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='text-gray-300 text-lg mb-6'
          >
            {`You've seen all available profiles. Check back later for more potential matches!`}
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors'
            onClick={() => window.location.reload()}
          >
            Refresh Profiles
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className='relative w-[85%] max-w-[500px] h-[85%] max-h-[800px]'>
      <AnimatePresence>
        {visibleCards.map((profile, index) => {
          const isTopCard = index === 0;
          const scale = 1 - index * 0.05;
          const yOffset = index * 30;
          const zIndex = visibleCards.length - index;

          return (
            <motion.div
              key={profile.id}
              className={`absolute w-full h-full`}
              style={{
                scale,
                y: yOffset,
                zIndex,
              }}
              initial={{ scale: 1, y: 0 }}
              animate={{
                scale,
                y: isTopCard && direction === 'up' ? -1000 : yOffset,
                x:
                  isTopCard && direction
                    ? direction === 'left'
                      ? -1000
                      : direction === 'right'
                      ? 1000
                      : 0
                    : 0,
                rotate:
                  isTopCard && direction
                    ? direction === 'left'
                      ? -30
                      : direction === 'right'
                      ? 30
                      : 0
                    : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              onTouchStart={isTopCard ? handleTouchStart : undefined}
              onTouchMove={isTopCard ? handleTouchMove : undefined}
              onTouchEnd={isTopCard ? handleTouchEnd : undefined}
            >
              <ProfileCardComponent
                profile={profile}
                isTopCard={isTopCard}
                onSwipe={handleSwipe}
                stackIndex={index}
                totalCards={visibleCards.length}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default CardStack;
