import React, { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselProps {
  photos: string[];
}

const Carousel: FC<CarouselProps> = ({ photos }) => {
  const [currIdx, setCurrIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrIdx((prevIdx) => (prevIdx + 1) % photos.length);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [photos.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  const slideTransition = {
    x: { type: 'spring', stiffness: 500, damping: 50, duration: 0.3 },
    opacity: { duration: 0.2 },
  };

  return (
    <div className='relative h-full overflow-hidden'>
      <AnimatePresence initial={false} custom={1}>
        <motion.div
          key={currIdx}
          custom={1}
          variants={slideVariants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={slideTransition}
          className='absolute inset-0'
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[currIdx]}
            alt={`Profile photo #${currIdx}`}
            className='w-full h-full object-cover rounded-lg'
          />
        </motion.div>
      </AnimatePresence>

      <div className='absolute bottom-4 left-0 right-0 flex justify-center space-x-2'>
        {photos.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currIdx ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
