'use client';

import React, { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, AlertCircle, Heart } from 'lucide-react';
import { useParams } from 'next/navigation';
import { IUserData } from '@/types/user';
import { getUserById } from '@/apiCalls';
import Loader from '@/components/Loader';
import TransactionWrapper from '@/components/TransactionWrapper';
import { getImageFromNFT } from '@/utils';
import { likeProfile } from '@/contract';
import { toast } from 'react-toastify';
import { useMatchMakingContract } from '@/components/EthereumProvider';
import { useStateContext } from '@/components/StateProvider';
import { formatDistanceToNowStrict } from 'date-fns';

const NftView: FC<{ nftUri: string }> = ({ nftUri }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    getImageFromNFT(nftUri).then((res) => {
      if (res) {
        setUrl(res);
      }
    });
  }, [nftUri]);

  return url ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className='bg-gray-700 p-4 rounded-lg flex flex-col items-center'
    >
      <img
        src={url}
        alt={`NFT ${nftUri}`}
        className='w-16 h-16 rounded-lg object-cover'
      />
    </motion.div>
  ) : (
    <></>
  );
};

const UserProfilePage = () => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<IUserData | null>(null);
  const matchMakingContract = useMatchMakingContract();
  const { userInfo } = useStateContext();

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      getUserById(params.id as string)
        .then((res) => {
          if (res.status === 'success') {
            setUserData(res.data!);
          }
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [params]);

  const handleLike = async () => {
    try {
      await likeProfile(matchMakingContract, userData?.walletAddress!);

      toast.success('Profile liked successfully! 💝');

      return true;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to like profile');
      return false;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center h-full justify-center'>
        <Loader />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className='flex items-center h-full justify-center'>
        <p className='text-gray-400'>User not found</p>
      </div>
    );
  }

  const isVerified = userData.isVerified;

  console.log('User Data:', userData);

  return (
    <div className='min-h-screen bg-gray-900 p-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden'
      >
        {/* Profile Header */}
        <div className='relative bg-gradient-to-r from-purple-600 to-blue-500 h-32 rounded-t-lg'>
          <div className='absolute -bottom-12 left-6 flex items-center gap-4'>
            <img
              src={userData.profile.profilePicture || '/default-avatar.png'}
              alt='Profile Picture'
              className='w-24 h-24 rounded-full object-cover border-4 border-gray-900'
            />
            <div>
              <h1 className='text-2xl font-bold text-white'>
                {userData.profile.firstName} {userData.profile.lastName}
              </h1>
              <p className='text-gray-200 text-sm'>
                {userData.profile.city || 'Unknown Location'}
              </p>
            </div>
          </div>
          <div className='absolute top-4 right-4'>
            {isVerified ? (
              <div className='flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full'>
                <BadgeCheck size={18} />
                <span className='text-sm font-medium'>Verified</span>
              </div>
            ) : (
              <div className='flex items-center gap-2 bg-yellow-500 text-white px-3 py-1 rounded-full'>
                <AlertCircle size={18} />
                <span className='text-sm font-medium'>Unverified</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className='p-6'>
          {/* About Section */}
          <div className='mt-6'>
            <h2 className='text-lg font-semibold text-white'>About</h2>
            <p className='text-gray-300 mt-2'>
              {userData.profile.bio ||
                'This user has not provided any information about themselves.'}
            </p>
          </div>

          {/* Interests Section */}
          {userData.profile.interests?.length && (
            <div className='mt-6'>
              <h2 className='text-lg font-semibold text-white'>Interests</h2>
              <div className='flex flex-wrap gap-2 mt-2'>
                {userData.profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className='bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm'
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* NFT Section for Verified Users */}
          {userData.files && (
            <div className='mt-6'>
              <h2 className='text-lg font-semibold text-white'>Photos</h2>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-4'>
                {userData.files?.map((nft, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className='bg-gray-700 p-4 rounded-lg flex flex-col items-center'
                  >
                    <img
                      src={nft}
                      alt={`NFT ${index + 1}`}
                      className='w-16 h-16 rounded-lg object-cover'
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* NFT Section for Verified Users */}
          {isVerified && userData.nfts && (
            <div className='mt-6'>
              <h2 className='text-lg font-semibold text-white'>Profile NFTs</h2>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-4'>
                {userData.nfts?.map((nft, index) => (
                  <NftView nftUri={nft} key={index} />
                ))}
              </div>
            </div>
          )}

          {/* Call to Action for Unverified Users */}
          {!isVerified && (
            <div className='mt-6'>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className='bg-yellow-500 p-4 rounded-lg text-center'
              >
                <p className='text-gray-900 font-medium'>
                  This user has not minted their Profile NFT yet.
                </p>
                <p className='text-gray-800 text-sm mt-1'>
                  Encourage them to mint their NFT to enhance their credibility.
                </p>
              </motion.div>
            </div>
          )}

          {/* Like Button */}
          <div className='mt-6 flex justify-center'>
            <TransactionWrapper
              tooltipContent={{
                default: userData.likedAt
                  ? `You have already liked this profile ${formatDistanceToNowStrict(
                      userData.likedAt,
                      { addSuffix: true }
                    )}.`
                  : `Click to like this profile.`,
              }}
              content={(disabled) => (
                <motion.button
                  {...(disabled
                    ? { whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 } }
                    : {})}
                  onClick={handleLike}
                  disabled={
                    disabled ||
                    !!userData.likedAt ||
                    !userInfo?.walletAddress ||
                    !userData.walletAddress
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    userData.likedAt
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Heart size={18} />
                  {userData.likedAt ? 'Liked' : 'Like'}
                </motion.button>
              )}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;
