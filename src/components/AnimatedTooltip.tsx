'use client';

import {
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  motion,
} from 'framer-motion';
import React, { FC, ReactNode, useState } from 'react';

interface AnimatedTooltipProps {
  children: ReactNode;
  tooltipContent: ReactNode;
  position?: 'top' | 'left' | 'right';
}

const AnimatedTooltip: FC<AnimatedTooltipProps> = ({
  children,
  tooltipContent,
  position = 'top',
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0); // going to set this value on mouse move
  // rotate the tooltip
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  // translate the tooltip
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );

  const tooltipStyles =
    position === 'right'
      ? { left: 'calc(100% + 1rem)', transform: 'translateY(-50%)' }
      : position === 'left'
      ? {
          right: 'calc(100% + 1rem)',
          transform: 'translateY(-50%)',
        }
      : { bottom: 'calc(100% + 1rem)' };

  return (
    <div
      className='group relative flex justify-center items-center'
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence mode='popLayout'>
        {isHovering && (
          <motion.div
            initial={{
              opacity: 0,
              x: position === 'right' ? -20 : position === 'left' ? 20 : 0,
              y: position === 'top' ? 20 : 0,
              scale: 0.6,
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 260,
                damping: 10,
              },
            }}
            exit={{
              opacity: 0,
              x: position === 'right' ? -20 : position === 'left' ? 20 : 0,
              y: position === 'top' ? 20 : 0,
              scale: 0.6,
            }}
            style={{
              translateX: translateX,
              rotate: rotate,
              ...tooltipStyles,
            }}
            className='absolute w-max z-[9999] flex flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl'
          >
            <div className='absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent' />
            <div className='absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 to-transparent' />
            {tooltipContent}
          </motion.div>
        )}
      </AnimatePresence>
      <div className='relative cursor-pointer transition duration-500 group-hover:z-30 group-hover:scale-110'>
        {children}
      </div>
    </div>
  );
};

export default AnimatedTooltip;
