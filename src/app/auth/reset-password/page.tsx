'use client';
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { toast } from 'react-toastify';
import Link from 'next/link';

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_BE_END_POINT}/profile/reset-password`,
        {
          password: newPassword,
          confirmPassword,
          token,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Password reset successfully. Please log in.');

      setNewPassword('');
      setConfirmPassword('');
      router.push('/auth/signin');
    } catch (err) {
      const errorResponse = (err as AxiosError<{ message: string }>).response
        ?.data;
      const errorMessage = errorResponse?.message.includes('Unauthorized')
        ? 'Current token is invalid or expired.'
        : errorResponse?.message;
      setError(errorMessage || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black'>
      <div className='w-full max-w-md space-y-8'>
        <h2 className='text-center text-3xl font-extrabold text-white'>
          Reset Your Password
        </h2>
        <form className='mt-8 space-y-6' onSubmit={handleResetPassword}>
          <div className='rounded-md shadow-sm space-y-3'>
            <div>
              <label htmlFor='new-password' className='sr-only'>
                New Password
              </label>
              <Input
                label='New Password'
                name='newPassword'
                type='password'
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                autoComplete='current-password'
                placeholder='Password'
              />
            </div>
            <div>
              <label htmlFor='confirm-password' className='sr-only'>
                Confirm Password
              </label>
              <Input
                label='Confirm Password'
                name='confirm-password'
                type='password'
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                autoComplete='current-password'
                placeholder='Confirm Password'
              />
            </div>
          </div>

          {error && (
            <div className='text-red-500 text-sm text-center !mt-2'>
              {error}
            </div>
          )}

          <div>
            <Button
              label={'Reset Password'}
              isLoading={isLoading}
              disabled={isLoading}
              loadingLabel='Resetting Password...'
              type='submit'
            />
          </div>
        </form>
        <div className='text-center !mt-4'>
          <Link
            href='/auth/signin'
            prefetch
            className='text-primary-400 hover:text-primary-300'
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
