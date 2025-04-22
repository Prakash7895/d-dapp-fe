'use client';

import React, { useState, useEffect } from 'react';
import CardStack from '@/components/CardStack';
import { AllUsers } from '@/types/user';
import Loader from '@/components/Loader';
import { getUsers } from '@/apiCalls';
import { motion } from 'framer-motion';
import { likeProfile } from '@/contract';
import { useStateContext } from '@/components/StateProvider';
import { toast } from 'react-toastify';
import { useMatchMakingContract } from '@/components/EthereumProvider';

const HomePage = () => {
  const [profiles, setProfiles] = useState<AllUsers[]>([]);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useStateContext();
  const matchMakingContract = useMatchMakingContract();

  useEffect(() => {
    setLoading(true);
    getUsers(1).then((res) => {
      console.log('res', res.data?.users);
      setProfiles(res.data?.users ?? []);
      setLoading(false);
    });
  }, []);

  const handleSwipe = async (
    direction: 'left' | 'right' | 'up',
    profile: AllUsers
  ) => {
    if (direction === 'right') {
      if (!profile.walletAddress || !userInfo?.walletAddress) {
        toast.error(
          `${
            !userInfo?.walletAddress
              ? 'You'
              : profile?.profile?.firstName + ' ' + profile?.profile?.lastName
          } dont have any wallet address connected.${
            !userInfo?.walletAddress ? ' Connect a wallet now to like.' : ''
          }`
        );
        return;
      }
      try {
        // Like the profile
        await likeProfile(matchMakingContract, profile?.walletAddress!);

        toast.success('Profile liked successfully! 💝');

        return true;
      } catch (error: any) {
        toast.error(error?.message || 'Failed to like profile');
        return false;
      }
    }
    return true;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader size={64} />
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className='h-full bg-gray-900 flex items-center justify-center p-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center max-w-md p-8 rounded-xl bg-gray-800/50 backdrop-blur-sm'
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className='mb-6'
          >
            <span className='text-6xl'>🔍</span>
          </motion.div>
          <h2 className='text-3xl font-bold text-white mb-4'>
            No Profiles Available
          </h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className='text-gray-300 text-lg mb-4'>
              We couldn't find any profiles matching your preferences right now.
            </p>
            <ul className='text-gray-400 text-left mb-6 space-y-2'>
              <li>• Try adjusting your search preferences</li>
              <li>• Expand your age range or distance settings</li>
              <li>• Check your internet connection</li>
            </ul>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='mt-6 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors'
              onClick={() => window.location.reload()}
            >
              Try Again
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className='h-full bg-gray-900 flex items-center justify-center p-4'>
      <CardStack profiles={profiles} onSwipe={handleSwipe} />
    </div>
  );
};

export default HomePage;
