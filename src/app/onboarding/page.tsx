'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import FileUploader from '@/components/FileUploader';
import { onboardUser } from '@/apiCalls';
import { interestOptions } from '@/components/UserInfo';
import { z } from 'zod';
import { OnboardingFormSchema, onboardingSchema } from '@/apiSchemas';
import Button from '@/components/Button';
import AppLogo from '@/components/AppLogo';
import {
  checkIfUserOnboarded,
  useStateContext,
} from '@/components/StateProvider';
import Loader from '@/components/Loader';
import { arrayToString } from '@/utils';

const OnboardingPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<OnboardingFormSchema>({
    profilePicture: null,
    bio: '',
    city: '',
    country: '',
    interests: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const {
    loading: isUserInfoLoading,
    userInfo,
    setUserInfo,
  } = useStateContext();

  useEffect(() => {
    if (userInfo && checkIfUserOnboarded(userInfo)) {
      router.replace('/');
    }
  }, [userInfo]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (interest: string) => {
    setFormData((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const validateForm = () => {
    try {
      onboardingSchema.parse(formData);
      if (formData.profilePicture === null) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: 'Profile picture is required',
        }));
        return false;
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        if (formData.profilePicture === null) {
          fieldErrors['profilePicture'] = 'Profile picture is required';
        }
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setLoading(true);
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('file', formData.profilePicture!);
      formDataToSubmit.append('bio', formData.bio);
      formDataToSubmit.append('city', formData.city);
      formDataToSubmit.append('country', formData.country);
      formDataToSubmit.append('interests', JSON.stringify(formData.interests));

      const response = await onboardUser(formDataToSubmit);

      if (response?.status === 'success') {
        setUserInfo(response.data!);
        toast.success('Profile completed successfully!');
        router.push('/'); // Redirect to the home page
      } else {
        toast.error(
          arrayToString(response?.message) || 'Failed to complete onboarding.'
        );
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isUserInfoLoading || checkIfUserOnboarded(userInfo!)) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-800'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='border min-h-screen flex flex-col items-center justify-center bg-gray-800'>
      <div className='max-w-3xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg'>
        <AppLogo className='flex flex-col items-center space-x-3' />
        <h1 className='text-xl font-bold text-white mt-6 mb-2'>
          Complete Your Profile
        </h1>
        <div className='space-y-4'>
          <div>
            <label className='block text-gray-300 mb-2'>Profile Picture</label>
            <FileUploader
              onSubmit={(file) =>
                setFormData((prev) => ({ ...prev, profilePicture: file }))
              }
            />
            {errors.profilePicture && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.profilePicture}
              </p>
            )}
          </div>
          <div>
            <label className='block text-gray-300 mb-2'>Bio</label>
            <textarea
              name='bio'
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className='w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500'
              placeholder='Tell us about yourself...'
            />
            {errors.bio && (
              <p className='text-red-500 text-sm mt-1'>{errors.bio}</p>
            )}
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-gray-300 mb-2'>City</label>
              <input
                type='text'
                name='city'
                value={formData.city}
                onChange={handleInputChange}
                className='w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500'
                placeholder='Enter your city'
              />
              {errors.city && (
                <p className='text-red-500 text-sm mt-1'>{errors.city}</p>
              )}
            </div>
            <div>
              <label className='block text-gray-300 mb-2'>Country</label>
              <input
                type='text'
                name='country'
                value={formData.country}
                onChange={handleInputChange}
                className='w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500'
                placeholder='Enter your country'
              />
              {errors.country && (
                <p className='text-red-500 text-sm mt-1'>{errors.country}</p>
              )}
            </div>
          </div>
          <div>
            <label className='block text-gray-300 mb-2'>Interests</label>
            <div className='flex flex-wrap gap-2'>
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type='button'
                  onClick={() => handleInterestChange(interest)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.interests.includes(interest)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {errors.interests && (
              <p className='text-red-500 text-sm mt-1'>{errors.interests}</p>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            label='Complete Profile'
            loadingLabel='Submitting...'
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
