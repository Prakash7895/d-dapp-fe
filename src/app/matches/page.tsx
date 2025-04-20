'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, User, MapPin, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Dummy data for matches
const dummyMatches = [
  {
    id: 1,
    name: 'Sarah Parker',
    age: 28,
    location: 'New York, USA',
    matchedOn: new Date('2025-04-15'),
    lastActive: '2 hours ago',
    bio: 'Adventure seeker & coffee enthusiast',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    interests: ['Travel', 'Photography', 'Hiking'],
  },
  // Add more dummy matches as needed
];

const MatchesPage = () => {
  const [matches] = useState(dummyMatches);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
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
            <motion.div
              key={match.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className='bg-gray-800 rounded-xl overflow-hidden'
            >
              <div className='relative h-64'>
                {match.image ? (
                  <img
                    src={match.image}
                    alt={match.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gray-700 flex items-center justify-center'>
                    <User className='w-16 h-16 text-gray-500' />
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='absolute top-4 right-4 bg-primary-500 rounded-full p-2'
                >
                  <Heart className='w-5 h-5 text-white' />
                </motion.div>
              </div>

              <div className='p-6 space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-xl font-semibold text-white'>
                    {match.name}, {match.age}
                  </h3>
                  <span className='text-sm text-gray-400'>
                    {match.lastActive}
                  </span>
                </div>

                <div className='flex items-center text-gray-400 text-sm'>
                  <MapPin className='w-4 h-4 mr-2' />
                  <span>{match.location}</span>
                </div>

                <p className='text-gray-300'>{match.bio}</p>

                <div className='flex flex-wrap gap-2'>
                  {match.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className='px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm'
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                <div className='flex items-center justify-between pt-4 border-t border-gray-700'>
                  <div className='flex items-center text-gray-400 text-sm'>
                    <Calendar className='w-4 h-4 mr-2' />
                    Matched {formatDistanceToNow(match.matchedOn)} ago
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-full text-sm hover:bg-primary-600 transition-colors'
                  >
                    <MessageCircle className='w-4 h-4' />
                    Message
                  </motion.button>
                </div>
              </div>
            </motion.div>
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
