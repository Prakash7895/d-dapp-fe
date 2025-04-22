'use client';

import React from 'react';
import { UserByAddress } from '@/types/user';
import { Modal, ModalBody, ModalContent, ModalTrigger } from './AnimatedModal';
import { motion } from 'framer-motion'; // Importing Framer Motion

interface MatchAnimationProps {
  matchedProfile: UserByAddress | null;
  showMatch: boolean;
  multiSigBalance: number;
  onClose: () => void;
}

const MatchAnimation: React.FC<MatchAnimationProps> = ({
  matchedProfile,
  showMatch,
  multiSigBalance,
  onClose,
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        staggerChildren: 0.3,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const heartVariants = {
    initial: {
      scale: 0,
      opacity: 0,
      y: 50,
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const floatingHearts = {
    animate: {
      y: [-10, 10],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse' as 'reverse',
        ease: 'easeInOut',
      },
    },
  };

  return (
    <Modal open={showMatch} setOpen={() => onClose()}>
      <ModalTrigger>
        <span className='absolute'></span>
      </ModalTrigger>
      <ModalBody className='max-w-[50%]'>
        <ModalContent>
          <motion.div
            className='p-10 rounded-lg shadow-lg text-center'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
          >
            <motion.div
              className='relative flex justify-center mb-8'
              variants={heartVariants}
              initial='initial'
              animate='animate'
            >
              <motion.div
                className='relative z-10'
                variants={floatingHearts}
                animate='animate'
              >
                <motion.svg
                  viewBox='0 0 512 512'
                  width='100'
                  height='80'
                  className='fill-red-500'
                >
                  <motion.path
                    initial={{ pathLength: 0, fill: 'none' }}
                    animate={{
                      pathLength: 1,
                      fill: '#ef4444',
                      transition: { duration: 2, ease: 'easeInOut' },
                    }}
                    stroke='#ef4444'
                    strokeWidth='20'
                    d='M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z'
                  />
                </motion.svg>
              </motion.div>

              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className='absolute'
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    x: [(i - 1) * 30, (i - 1) * 40],
                    y: [0, -60],
                    transition: {
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                >
                  <svg
                    viewBox='0 0 24 24'
                    width='20'
                    height='20'
                    className='fill-pink-400'
                  >
                    <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
                  </svg>
                </motion.div>
              ))}
            </motion.div>

            <motion.h2
              className='text-3xl font-bold text-primary-500 mb-4'
              variants={textVariants}
            >
              {"It's a Match!"}
            </motion.h2>
            <motion.p className='text-gray-700 text-lg' variants={textVariants}>
              You and {matchedProfile?.profile?.firstName}{' '}
              {matchedProfile?.profile?.lastName} have liked each other
            </motion.p>
            <motion.p
              className='text-gray-700 text-lg mb-4'
              variants={textVariants}
            >
              You can now start chatting with each other!
            </motion.p>
            <motion.p className='text-gray-700 text-lg' variants={textVariants}>
              The ETH you both spent on liking each other has been added to your
              shared multisig wallet. Your combined share is {multiSigBalance}{' '}
              ETH.
            </motion.p>
          </motion.div>
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

export default MatchAnimation;
