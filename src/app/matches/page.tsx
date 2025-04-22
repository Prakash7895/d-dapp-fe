'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import UserMatchCard from '@/components/UserMatchCard';
import { getMatchedUsers } from '@/apiCalls';
import { MatchedUser } from '@/types/user';

const MatchesPage = () => {
  const [matches, setMatches] = useState<MatchedUser[]>([]);

  useEffect(() => {
    getMatchedUsers(1).then((res) => {
      if (res.status === 'success') {
        setMatches(res.data?.users ?? []);
      }
    });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className='min-h-screen bg-gray-900 p-8'>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-7xl mx-auto'
      >
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-3xl font-bold text-white'>Your Matches</h1>
          <div className='flex items-center gap-2'>
            <Heart className='text-primary-500 w-6 h-6' />
            <span className='text-gray-400'>{matches.length} matches</span>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='show'
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        >
          {matches.map((match) => (
            <UserMatchCard key={match.id} {...match} />
          ))}
        </motion.div>

        {matches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-16'
          >
            <Heart className='w-16 h-16 text-gray-600 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-white mb-2'>
              No Matches Yet
            </h3>
            <p className='text-gray-400'>
              Keep exploring to find your perfect match!
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MatchesPage;
