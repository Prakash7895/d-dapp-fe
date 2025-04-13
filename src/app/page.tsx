'use client';

import React, { useState, useEffect } from 'react';
import { useStateContext } from '@/components/StateProvider';
import CardStack from '@/components/CardStack';
import { ProfileCard } from '@/types/user';
import Loader from '@/components/Loader';
import { GENDER_PREFERENCES } from '@/apiSchemas';

const HomePage = () => {
  const { userInfo } = useStateContext();
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<ProfileCard | null>(
    null
  );

  useEffect(() => {
    const mockProfiles: ProfileCard[] = [
      {
        id: 1,
        firstName: 'Emma',
        lastName: 'Watson',
        age: 28,
        maxDistance: 5,
        bio: 'Book lover and coffee enthusiast. Looking for meaningful connections.',
        interests: ['Reading', 'Hiking', 'Photography'],
        photos: ['profile1.jpg', 'profile2.avif', 'profile3.jpg'],
        city: 'London',
        country: 'UK',
        gender: 'FEMALE',
        genderPreference: GENDER_PREFERENCES.MALE,
        sexualOrientation: 'STRAIGHT',
      },
      {
        id: 2,
        firstName: 'James',
        lastName: 'Smith',
        age: 32,
        maxDistance: 10,
        bio: 'Tech entrepreneur and adventure seeker. Love to travel and explore new cultures.',
        interests: ['Technology', 'Travel', 'Cooking'],
        photos: ['profile2.avif', 'profile1.jpg', 'profile3.jpg'],
        city: 'New York',
        country: 'USA',
        gender: 'MALE',
        genderPreference: GENDER_PREFERENCES.FEMALE,
        sexualOrientation: 'STRAIGHT',
      },
      {
        id: 3,
        firstName: 'Sophia',
        lastName: 'Chen',
        age: 26,
        maxDistance: 8,
        bio: 'Art lover and yoga instructor. Passionate about wellness and creativity.',
        interests: ['Yoga', 'Art', 'Meditation'],
        photos: ['profile3.jpg', 'profile1.jpg', 'profile2.avif'],
        city: 'Tokyo',
        country: 'Japan',
        gender: 'FEMALE',
        genderPreference: GENDER_PREFERENCES.MALE,
        sexualOrientation: 'STRAIGHT',
      },
      {
        id: 4,
        firstName: 'Michael',
        lastName: 'Brown',
        age: 30,
        maxDistance: 15,
        bio: 'Musician and nature enthusiast. Always up for a new adventure.',
        interests: ['Music', 'Hiking', 'Photography'],
        photos: ['profile1.jpg', 'profile3.jpg', 'profile2.avif'],
        city: 'Sydney',
        country: 'Australia',
        gender: 'MALE',
        genderPreference: GENDER_PREFERENCES.FEMALE,
        sexualOrientation: 'STRAIGHT',
      },
      {
        id: 5,
        firstName: 'Isabella',
        lastName: 'Garcia',
        age: 27,
        maxDistance: 7,
        bio: 'Food blogger and travel enthusiast. Love trying new cuisines and exploring new places.',
        interests: ['Food', 'Travel', 'Photography'],
        photos: ['profile2.avif', 'profile3.jpg', 'profile1.jpg'],
        city: 'Barcelona',
        country: 'Spain',
        gender: 'FEMALE',
        genderPreference: GENDER_PREFERENCES.MALE,
        sexualOrientation: 'STRAIGHT',
      },
      {
        id: 6,
        firstName: 'David',
        lastName: 'Kim',
        age: 31,
        maxDistance: 12,
        bio: 'Software developer and fitness enthusiast. Love coding and working out.',
        interests: ['Coding', 'Fitness', 'Gaming'],
        photos: ['profile3.jpg', 'profile2.avif', 'profile1.jpg'],
        city: 'Seoul',
        country: 'South Korea',
        gender: 'MALE',
        genderPreference: GENDER_PREFERENCES.FEMALE,
        sexualOrientation: 'STRAIGHT',
      },
      {
        id: 7,
        firstName: 'Olivia',
        lastName: 'Martinez',
        age: 29,
        maxDistance: 6,
        bio: 'Fashion designer and art lover. Passionate about creativity and style.',
        interests: ['Fashion', 'Art', 'Design'],
        photos: ['profile1.jpg', 'profile2.avif', 'profile3.jpg'],
        city: 'Paris',
        country: 'France',
        gender: 'FEMALE',
        genderPreference: GENDER_PREFERENCES.MALE,
        sexualOrientation: 'STRAIGHT',
      },
      {
        id: 8,
        firstName: 'Alexander',
        lastName: 'Wong',
        age: 33,
        maxDistance: 9,
        bio: 'Entrepreneur and foodie. Love building businesses and trying new restaurants.',
        interests: ['Business', 'Food', 'Travel'],
        photos: ['profile2.avif', 'profile1.jpg', 'profile3.jpg'],
        city: 'Singapore',
        country: 'Singapore',
        gender: 'MALE',
        genderPreference: GENDER_PREFERENCES.FEMALE,
        sexualOrientation: 'STRAIGHT',
      },
      {
        id: 9,
        firstName: 'Ava',
        lastName: 'Johnson',
        age: 25,
        maxDistance: 8,
        bio: 'Yoga instructor and wellness coach. Passionate about helping others live healthier lives.',
        interests: ['Yoga', 'Wellness', 'Meditation'],
        photos: ['profile3.jpg', 'profile1.jpg', 'profile2.avif'],
        city: 'Vancouver',
        country: 'Canada',
        gender: 'FEMALE',
        genderPreference: GENDER_PREFERENCES.MALE,
        sexualOrientation: 'STRAIGHT',
      },
      {
        id: 10,
        firstName: 'William',
        lastName: 'Taylor',
        age: 34,
        maxDistance: 11,
        bio: 'Photographer and travel blogger. Always on the lookout for the next great shot.',
        interests: ['Photography', 'Travel', 'Writing'],
        photos: ['profile1.jpg', 'profile3.jpg', 'profile2.avif'],
        city: 'Cape Town',
        country: 'South Africa',
        gender: 'MALE',
        genderPreference: GENDER_PREFERENCES.FEMALE,
        sexualOrientation: 'STRAIGHT',
      },
    ];

    setProfiles(mockProfiles);
    setLoading(false);
  }, []);

  const handleSwipe = (direction: 'left' | 'right', profile: ProfileCard) => {
    if (direction === 'right') {
      // Simulate match
      if (Math.random() > 0.7) {
        setMatchedProfile(profile);
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader size={64} />
      </div>
    );
  }

  return (
    <div className='h-full bg-gray-900 flex items-center justify-center p-4'>
      <CardStack profiles={profiles} onSwipe={handleSwipe} />

      {/* Match Animation */}
      {showMatch && matchedProfile && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/50'>
          <div className='bg-white p-8 rounded-lg text-center'>
            <h2 className='text-2xl font-bold text-primary-500 mb-4'>
              It's a Match!
            </h2>
            <p className='text-gray-600'>
              You and {matchedProfile.firstName} {matchedProfile.lastName} have
              liked each other
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
