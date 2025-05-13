'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ScreenLoader from '@/components/ScreenLoader';
import useSession from '@/hooks/useSession';
import { login, resetUserPassword } from '@/apiCalls';
import { SignInType } from '@/types/user';
import { createQueryString } from '@/utils';
import TransactionBtn from '@/components/TransactionBtn';
import { JsonRpcSigner } from 'ethers';
import { useEthereum } from '@/components/EthereumProvider';
import AppLogo from '@/components/AppLogo';
import { toast } from 'react-toastify';

export default function SignIn() {
  const router = useRouter();
  const { status, fetchSession } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>('');
  const searchParams = useSearchParams();
  const wallet = searchParams.get('wallet');
  const { connectedAddress } = useEthereum();
  const [resetPassword, setResetPassword] = useState(false);

  const [authMethod, setAuthMethod] = useState<SignInType>(
    wallet ? SignInType.WALLET : SignInType.EMAIL
  );
  const pathName = usePathname();

  useEffect(() => {
    if (wallet) {
      setAuthMethod(SignInType.WALLET);
    } else {
      setAuthMethod(SignInType.EMAIL);
    }
  }, [wallet]);

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
      const res = await login({ type: SignInType.EMAIL, email, password });
      if (res.status === 'success') {
        sessionStorage.setItem('accessToken', res.data!.access_token!);
        sessionStorage.setItem('refreshToken', res.data!.refresh_token!);
        await fetchSession();
        router.push('/');
      } else {
        setError(res?.message || 'An error occurred');
      }
    } catch (error) {
      setError((error as Error).message || 'An error occurred during sign in');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await resetUserPassword({ email });
      if (res.status === 'success') {
        toast.success('Password reset email sent. Please check your inbox.');
        setEmail('');
        setResetPassword(false);
      } else {
        setError(res?.message || 'An error occurred');
      }
    } catch (error) {
      setError((error as Error).message || 'An error occurred during sign in');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletSignIn = async (signer: JsonRpcSigner) => {
    setIsLoading(true);
    setError('');

    try {
      const address = await signer.getAddress();

      // Create a message to sign
      const message = `${process.env.NEXT_PUBLIC_MESSAGE_TO_VERIFY}${address}`;

      // Sign the message
      const signature = await signer.signMessage(message);

      // Sign in with the wallet
      const res = await login({
        type: SignInType.WALLET,
        walletAddress: address!,
        signedMessage: signature,
      });

      if (res.status === 'success') {
        sessionStorage.setItem('accessToken', res.data!.access_token);
        sessionStorage.setItem('refreshToken', res.data!.refresh_token);
        await fetchSession();
        router.push('/');
      } else {
        if (res.message?.includes('sign up')) {
          setError(
            <>
              {res.message}{' '}
              <button
                onClick={() => router.push('/auth/signup')}
                className='text-primary-400 hover:text-primary-300 underline'
              >
                Sign up now
              </button>
            </>
          );
        }
      }
    } catch (error: unknown) {
      if ((error as Error).message.includes('User rejected')) {
        setError('You rejected the signature request. Please try again.');
      } else {
        setError(
          (error as Error).message || 'An error occurred during wallet sign in'
        );
      }
      console.log(error);
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
    <div className='flex min-h-screen flex-col items-center justify-center gap-10 py-12 px-4 sm:px-6 lg:px-8 bg-black'>
      <AppLogo className='flex flex-col items-center space-x-3' />
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-2xl font-bold tracking-tight text-white'>
            {resetPassword ? 'Reset your password' : 'Sign in to your account'}
          </h2>
        </div>

        <div className='mt-8 space-y-6'>
          {!resetPassword && (
            <div className='flex justify-center space-x-4 mb-6'>
              <Link
                href={pathName}
                onClick={() => setAuthMethod(SignInType.EMAIL)}
                className={`px-4 py-2 rounded-md ${
                  authMethod === SignInType.EMAIL
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Email & Password
              </Link>
              <Link
                href={
                  pathName +
                  createQueryString(searchParams, SignInType.WALLET, 'true')
                }
                onClick={() => setAuthMethod(SignInType.WALLET)}
                className={`px-4 py-2 rounded-md ${
                  authMethod === SignInType.WALLET
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Wallet
              </Link>
            </div>
          )}

          {authMethod === SignInType.EMAIL ? (
            <form
              className='mt-8 space-y-6'
              onSubmit={resetPassword ? handleResetPassword : handleEmailSignIn}
            >
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
                  inputClassName={resetPassword ? '' : 'rounded-b-none'}
                />
                {!resetPassword && (
                  <Input
                    label='Password'
                    name='password'
                    type='password'
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    autoComplete='current-password'
                    placeholder='Password'
                    labelClassName='sr-only'
                    inputClassName='rounded-t-none'
                  />
                )}
              </div>

              {error && (
                <div className='text-red-500 text-sm text-center'>{error}</div>
              )}

              <div>
                <Button
                  label={resetPassword ? 'Reset Password' : 'Sign in'}
                  isLoading={isLoading}
                  disabled={isLoading}
                  loadingLabel={
                    resetPassword ? 'Sending email...' : 'Signing in...'
                  }
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
                {connectedAddress && (
                  <div className='mb-4 p-3 bg-gray-800 rounded-md'>
                    <p className='text-sm text-gray-300'>Connected wallet:</p>
                    <p className='text-xs text-gray-400 truncate'>
                      {connectedAddress}
                    </p>
                  </div>
                )}
                <TransactionBtn
                  onClickWithSigner={handleWalletSignIn}
                  label={
                    !connectedAddress
                      ? 'Connect Wallet'
                      : 'Sign in with connected wallet address'
                  }
                  isLoading={isLoading}
                  disabled={isLoading}
                  loadingLabel='Connecting...'
                  type='submit'
                />
              </div>
            </div>
          )}

          {resetPassword ? (
            <div
              className='text-center'
              onClick={() => {
                setAuthMethod(SignInType.EMAIL);
                setResetPassword(false);
              }}
            >
              <p className='text-primary-400 hover:text-primary-300 cursor-pointer'>
                Sign in
              </p>
            </div>
          ) : (
            <div
              className='text-center'
              onClick={() => {
                setAuthMethod(SignInType.EMAIL);
                setResetPassword(true);
              }}
            >
              <p className='text-primary-400 hover:text-primary-300 cursor-pointer'>
                Forgot your password? Reset it here
              </p>
            </div>
          )}

          <div className='text-center'>
            <Link
              href='/auth/signup'
              prefetch
              className='text-primary-400 hover:text-primary-300'
            >
              {"Don't have an account? Sign up"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
