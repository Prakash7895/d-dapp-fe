'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileCard } from '@/types/user';
import ProfileCardComponent from './ProfileCard';

interface CardStackProps {
  profiles: ProfileCard[];
  onSwipe: (direction: 'left' | 'right' | 'up', profile: ProfileCard) => void;
}

const CardStack: React.FC<CardStackProps> = ({ profiles, onSwipe }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const xTouchStart = useRef<number | null>(null);
  const xTouchEnd = useRef<number | null>(null);
  const yTouchStart = useRef<number | null>(null);
  const yTouchEnd = useRef<number | null>(null);

  const visibleCards = profiles.slice(currentIndex, currentIndex + 4);

  const handleSwipe = (dir: 'left' | 'right' | 'up') => {
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
