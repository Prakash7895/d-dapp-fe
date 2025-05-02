'use client';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  User,
  MapPin,
  Calendar,
  Wallet,
  Mars,
  Venus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FC } from 'react';
import { MatchedUser } from '@/types/user';
import Link from 'next/link';
import { capitalizeFirstLetter } from '@/utils';
import { useRouter } from 'next/navigation';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

const UserMatchCard: FC<MatchedUser> = ({
  id,
  lastActiveOn,
  matchedAt,
  profile,
  addressA,
  addressB,
  chatRoomId,
}) => {
  const name = `${profile.firstName} ${profile.lastName}`;
  const router = useRouter();
  return (
    <motion.div
      key={id}
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className='bg-gray-800 rounded-xl overflow-hidden'
    >
      <div className='relative h-64'>
        {profile.profilePicture ? (
          <img
            src={profile.profilePicture}
            alt={name}
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
        <div className='flex flex-col gap-1 items-center justify-between'>
          <h3 className='text-xl font-semibold text-white gap-2 w-full truncate'>
            {capitalizeFirstLetter(profile.firstName || '')}{' '}
            {capitalizeFirstLetter(profile.lastName || '')}
          </h3>
          <div className='flex items-center justify-start gap-2 mr-auto'>
            {profile.gender === 'MALE' ? (
              <Mars className='w-5 h-5 text-blue-400' />
            ) : (
              <Venus className='w-5 h-5 text-pink-400' />
            )}
            <span className='text-gray-400'>{profile.age} y/o</span>
          </div>
        </div>

        {profile.city && (
          <div className='flex items-center text-gray-400 text-sm'>
            <MapPin className='w-4 h-4 mr-2 shrink-0' />
            <span className='truncate'>
              {profile.city}, {profile.country}
            </span>
          </div>
        )}

        <p className='text-gray-300 line-clamp-2'>{profile.bio}</p>

        <div className='flex flex-wrap gap-2 items-center'>
          {profile.interests?.slice(0, 3)?.map((interest, idx) => (
            <span
              key={idx}
              className='px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm'
            >
              {interest}
            </span>
          ))}
          {(profile.interests?.length || 0) > 3 && (
            <span className='px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm'>
              +{profile.interests!.length - 3} more
            </span>
          )}
        </div>

        <div className='flex items-center justify-between pt-4 border-t border-gray-700'>
          <div className='flex items-center text-gray-400 text-sm'>
            <Calendar className='w-4 h-4 mr-2' />
            Matched {formatDistanceToNow(matchedAt)} ago
          </div>
          <div className='flex items-center gap-2'>
            <Link
              href={`/wallet/${addressA}/${addressB}`}
              className='flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-full text-sm hover:bg-gray-600 transition-colors'
            >
              <Wallet className='w-4 h-4' />
              Wallet
            </Link>
            <motion.button
              {...(chatRoomId
                ? { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } }
                : {})}
              disabled={!chatRoomId}
              onClick={() => {
                router.push(`/chat/${chatRoomId}`);
              }}
              className='flex items-center gap-2 px-4 py-2 bg-primary-500 disabled:opacity-75 text-white rounded-full text-sm hover:enabled:bg-primary-600 transition-colors'
            >
              <MessageCircle className='w-4 h-4' />
              Message
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserMatchCard;
