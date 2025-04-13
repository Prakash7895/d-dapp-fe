'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileCard } from '@/types/user';
import ProfileCardComponent from './ProfileCard';

interface CardStackProps {
  profiles: ProfileCard[];
  onSwipe: (direction: 'left' | 'right', profile: ProfileCard) => void;
}

const CardStack: React.FC<CardStackProps> = ({ profiles, onSwipe }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const visibleCards = profiles.slice(currentIndex, currentIndex + 4);

  const handleSwipe = (dir: 'left' | 'right') => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    onSwipe(dir, profiles[currentIndex]);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
      setIsAnimating(false);
    }, 500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleSwipe('left');
    } else if (isRightSwipe) {
      handleSwipe('right');
    }

    touchStart.current = null;
    touchEnd.current = null;
  };

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
              className={`absolute w-full h-full ${
                isTopCard ? 'cursor-grab active:cursor-grabbing' : ''
              }`}
              style={{
                scale,
                y: yOffset,
                zIndex,
              }}
              initial={{ scale: 1, y: 0 }}
              animate={{
                scale,
                y: yOffset,
                x:
                  isTopCard && direction
                    ? direction === 'left'
                      ? -1000
                      : 1000
                    : 0,
                rotate:
                  isTopCard && direction
                    ? direction === 'left'
                      ? -30
                      : 30
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
