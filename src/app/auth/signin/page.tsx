'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ScreenLoader from '@/components/ScreenLoader';
import useSession from '@/hooks/useSession';
import { login } from '@/apiCalls';
import { SignInType } from '@/types/user';
import { createQueryString } from '@/utils';
import TransactionBtn from '@/components/TransactionBtn';
import { JsonRpcSigner } from 'ethers';
import { useEthereum } from '@/components/EthereumProvider';

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
      login({ type: SignInType.EMAIL, email, password }).then(async (res) => {
        console.log('res', res);
        if (res.status === 'success') {
          sessionStorage.setItem('accessToken', res.data!.access_token!);
          sessionStorage.setItem('refreshToken', res.data!.refresh_token!);
          await fetchSession();
          router.push('/');
        } else {
          setError(res?.message || 'An error occurred');
        }
      });
    } catch (error) {
      setError((error as Error).message || 'An error occurred during sign in');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletSignIn = async (signer: JsonRpcSigner) => {
    setIsLoading(true);
    setError('');
    console.log('signer', signer);
    try {
      const address = await signer.getAddress();
      console.log('address', address);

      // Create a message to sign
      const message = `${process.env.NEXT_PUBLIC_MESSAGE_TO_VERIFY}${address}`;
      console.log('message', message);
      // Sign the message
      const signature = await signer.signMessage(message);
      console.log('address', address);

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
    <div className='flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-white'>
            Sign in to your account
          </h2>
        </div>

        <div className='mt-8 space-y-6'>
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

          {authMethod === SignInType.EMAIL ? (
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
                  value={password}
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
