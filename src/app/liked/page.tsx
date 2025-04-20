'use client';
import { getLikedUsers } from '@/apiCalls';
import React, { useEffect, useState } from 'react';
import { LikdedUser } from '@/types/user';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Loader, MapPin, Mars, User, Venus, X } from 'lucide-react';
import { capitalizeFirstLetter } from '@/utils';

const LikedPage = () => {
  const [users, setUsers] = useState<LikdedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLikedUsers();
  }, []);

  const fetchLikedUsers = async () => {
    const response = await getLikedUsers(1, 10);
    console.log('response', response);
    if (response.status === 'success' && response.data) {
      setUsers(response.data.users);
      setTotal(response.data.total);
    }
    setLoading(false);
  };

  const handleUnlike = async (userId: string) => {
    // Implement unlike functionality
    console.log('Unlike user:', userId);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-900'>
        <Loader size={48} className='text-primary-500 animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 p-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-7xl mx-auto'
      >
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-3xl font-bold text-white'>Liked Profiles</h1>
          <span className='text-gray-400'>Total: {total}</span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className='bg-gray-800 rounded-xl p-6 relative overflow-hidden group'
            >
              {/* Profile Image */}
              <div className='relative w-full h-48 mb-4 rounded-lg overflow-hidden'>
                {user.files && user.files.length > 0 ? (
                  <img
                    src={user.files[0]}
                    alt={`${user.profile.firstName}'s profile`}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gray-700 flex items-center justify-center'>
                    <User className='w-16 h-16 text-gray-500' />
                  </div>
                )}

                {/* Liked Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='absolute top-4 right-4'
                >
                  <Heart className='w-6 h-6 text-primary-500 fill-primary-500' />
                </motion.div>
              </div>

              {/* User Info */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-xl font-semibold text-white flex items-center gap-2'>
                    {capitalizeFirstLetter(user.profile.firstName || '')}{' '}
                    {capitalizeFirstLetter(user.profile.lastName || '')}
                    {user.profile.gender === 'MALE' ? (
                      <Mars className='w-5 h-5 text-blue-400' />
                    ) : (
                      <Venus className='w-5 h-5 text-pink-400' />
                    )}
                  </h3>
                  <span className='text-gray-400'>{user.profile.age} y/o</span>
                </div>

                <div className='flex items-center text-gray-400 text-sm'>
                  <MapPin className='w-4 h-4 mr-1' />
                  {user.profile.city && (
                    <span>
                      {capitalizeFirstLetter(user.profile.city)},{' '}
                      {capitalizeFirstLetter(user.profile.country || '')}
                    </span>
                  )}
                </div>

                {user.profile.bio && (
                  <p className='text-gray-300 text-sm line-clamp-2'>
                    {user.profile.bio}
                  </p>
                )}

                {/* Interests */}
                <div className='flex flex-wrap gap-2'>
                  {user.profile.interests?.slice(0, 3).map((interest, idx) => (
                    <span
                      key={idx}
                      className='px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs'
                    >
                      {interest}
                    </span>
                  ))}
                  {(user.profile.interests?.length || 0) > 3 && (
                    <span className='text-gray-400 text-xs'>
                      +{user.profile.interests!.length - 3} more
                    </span>
                  )}
                </div>

                {/* Liked Time & Unlike Button */}
                <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-700'>
                  <span className='text-sm text-gray-400'>
                    Liked {formatDistanceToNow(new Date(user.likedAt || ''))}{' '}
                    ago
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUnlike(user.id)}
                    className='flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm hover:bg-red-500/20 transition-colors'
                  >
                    <X className='w-4 h-4' />
                    Unlike
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {users.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-16'
          >
            <Heart className='w-16 h-16 text-gray-600 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-white mb-2'>
              No Liked Profiles Yet
            </h3>
            <p className='text-gray-400'>
              Start exploring and like profiles that interest you
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LikedPage;
