'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { connectWallet } from '@/contract';
import { ethers } from 'ethers';
import Link from 'next/link';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Loader from '@/components/Loader';
import ScreenLoader from '@/components/ScreenLoader';

export default function SignIn() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'wallet'>('email');

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('An error occurred during sign in');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Connect wallet
      const walletResult = await connectWallet();
      const address = walletResult.address;

      if (!address) {
        throw new Error('Failed to connect wallet');
      }

      // Create a message to sign
      const message = `${process.env.NEXT_PUBLIC_MESSAGE_TO_VERIFY}${address}`;

      // Get the signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Sign the message
      const signature = await signer.signMessage(message);

      // Sign in with the wallet
      const result = await signIn('wallet', {
        address,
        signature,
        redirect: false,
      });

      if (result?.error) {
        setError('Failed to authenticate with wallet');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('An error occurred during wallet sign in');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return <ScreenLoader />;
  }

  // Don't render the form if already authenticated
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-white'>
            Sign in to your account
          </h2>
        </div>

        <div className='mt-8 space-y-6'>
          <div className='flex justify-center space-x-4 mb-6'>
            <button
              onClick={() => setAuthMethod('email')}
              className={`px-4 py-2 rounded-md ${
                authMethod === 'email'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => setAuthMethod('wallet')}
              className={`px-4 py-2 rounded-md ${
                authMethod === 'wallet'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Wallet
            </button>
          </div>

          {authMethod === 'email' ? (
            <form className='mt-8 space-y-6' onSubmit={handleEmailSignIn}>
              <div className='rounded-md shadow-sm -space-y-px'>
                <Input
                  label='Email address'
                  name='email'
                  type='email'
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  autoComplete='email'
                  placeholder='Email address'
                  labelClassName='sr-only'
                  inputClassName='rounded-b-none'
                />
                <Input
                  label='Password'
                  name='password'
                  type='password'
                  onChange={(e) => setPassword(e.target.value)}
                  value={email}
                  autoComplete='current-password'
                  placeholder='Password'
                  labelClassName='sr-only'
                  inputClassName='rounded-t-none'
                />
              </div>

              {error && (
                <div className='text-red-500 text-sm text-center'>{error}</div>
              )}

              <div>
                <Button
                  label='Sign in'
                  isLoading={isLoading}
                  disabled={isLoading}
                  loadingLabel='Signing in...'
                  type='submit'
                />
              </div>
            </form>
          ) : (
            <div className='mt-8 space-y-6'>
              {error && (
                <div className='text-red-500 text-sm text-center'>{error}</div>
              )}

              <div>
                <Button
                  onClick={handleWalletSignIn}
                  label='Connect Wallet'
                  isLoading={isLoading}
                  disabled={isLoading}
                  loadingLabel='Connecting...'
                  type='submit'
                />
              </div>
            </div>
          )}

          <div className='text-center'>
            <Link
              href='/auth/signup'
              className='text-primary-400 hover:text-primary-300'
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
