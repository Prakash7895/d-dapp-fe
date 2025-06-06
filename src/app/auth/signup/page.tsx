'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ethers } from 'ethers';
import Link from 'next/link';
import Input from '@/components/Input';
import Select from '@/components/Select';
import {
  createQueryString,
  genderOptions,
  sexualOrientationOptions,
} from '@/utils';
import { SignInType, UserFormData } from '@/types/user';
import Button from '@/components/Button';
import { toast } from 'react-toastify';
import { getUserLocation } from '@/userLocation';
import useSession from '@/hooks/useSession';
import axiosInstance from '@/apiCalls';
import TransactionBtn from '@/components/TransactionBtn';
import { useEthereum } from '@/components/EthereumProvider';
import AppLogo from '@/components/AppLogo';

export default function SignUp() {
  const router = useRouter();
  const { status } = useSession();
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    sexualOrientation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = useSearchParams();
  const wallet = searchParams.get('wallet');

  const [authMethod, setAuthMethod] = useState<SignInType>(
    wallet ? SignInType.WALLET : SignInType.EMAIL
  );
  const [walletAddress, setWalletAddress] = useState('');
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const pathName = usePathname();
  const { isConnecting } = useEthereum();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  useEffect(() => {
    getUserLocation()
      .then((res) => {
        setLocation(res);
      })
      .then((err) => console.log('err', err));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate form data
      if (
        !formData.email ||
        !formData.password ||
        !formData.firstName ||
        !formData.lastName ||
        !formData.age ||
        !formData.gender ||
        !formData.sexualOrientation
      ) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Create user with email/password
      await axiosInstance.post('/users', {
        ...formData,
        age: +formData.age,
        ...location,
      });

      router.push('/auth/signin');

      // Redirect to sign in page
    } catch (error) {
      setError(
        (error as Error).message || 'An error occurred during registration'
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async (signer: ethers.JsonRpcSigner) => {
    setError('');

    try {
      // Connect wallet
      const address = await signer.getAddress();
      setWalletAddress(address);
      setAuthMethod(SignInType.WALLET);
    } catch (error) {
      setError('An error occurred while connecting wallet');
      console.log(error);
    }
  };

  useEffect(() => {
    if (wallet) {
      setAuthMethod(SignInType.WALLET);
    } else {
      setAuthMethod(SignInType.EMAIL);
    }
  }, [wallet]);

  const handleWalletSignUp = async (signer: ethers.JsonRpcSigner) => {
    setIsLoading(true);
    setError('');

    try {
      // Validate form data
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.age ||
        !formData.gender ||
        !formData.sexualOrientation ||
        !walletAddress
      ) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Create a message to sign
      const message = `${
        process.env.NEXT_PUBLIC_MESSAGE_TO_VERIFY
      }${walletAddress.toLowerCase()}`;

      // Sign the message
      const signature = await signer.signMessage(message);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, email, ...restFormData } = formData;

      // Create user with wallet address
      const res = await axiosInstance.post('/users', {
        ...restFormData,
        age: +restFormData.age,
        walletAddress: walletAddress.toLowerCase(),
        signature,
        ...location,
      });

      const data = res.data;
      toast.success(data?.message);
      router.push(`/auth/signin?${SignInType.WALLET}=true`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred during registration'
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <div className='text-white'>Loading...</div>
      </div>
    );
  }

  // Don't render the form if already authenticated
  if (status === 'authenticated') {
    return null;
  }

  const formRenderer = [
    { label: 'First Name', name: 'firstName', type: 'text' },
    { label: 'Last Name', name: 'lastName', type: 'text' },
    ...(authMethod === SignInType.EMAIL
      ? [
          {
            label: 'Email address',
            name: 'email',
            type: 'email',
            autoComplete: 'email',
            className: 'col-span-2',
          },
          {
            label: 'Password',
            name: 'password',
            type: 'password',
            autoComplete: 'new-password',
            className: 'col-span-2',
          },
        ]
      : []),
    { label: 'Age', name: 'age', type: 'number', className: 'col-span-2' },
    {
      label: 'Gender',
      name: 'gender',
      type: 'select',
      options: genderOptions,
      placeholder: 'Select gender',
      className: 'col-span-2',
    },
    {
      label: 'Sexual Orientation',
      name: 'sexualOrientation',
      type: 'select',
      options: sexualOrientationOptions,
      placeholder: 'Select orientation',
      className: 'col-span-2',
    },
  ].map((el) =>
    el.type === 'select' ? (
      <Select
        key={el.name}
        options={el.options!}
        label={el.label}
        name={el.name}
        value={formData[el.name as keyof UserFormData] as string}
        onChange={handleInputChange}
        placeholder={el.placeholder}
        className='col-span-2'
      />
    ) : (
      <Input
        key={el.name}
        label={el.label}
        name={el.name}
        onChange={handleInputChange}
        value={formData[el.name as keyof UserFormData]}
        className={el.className}
        type={el.type}
        autoComplete={el.autoComplete}
      />
    )
  );

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-3 py-12 px-4 sm:px-6 lg:px-8 bg-black'>
      <AppLogo className='flex flex-col items-center space-x-3' />
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-2xl font-bold tracking-tight text-white'>
            Create your account
          </h2>
        </div>

        <div className='mt-8 space-y-6'>
          <div className='flex justify-center space-x-4 mb-6'>
            <Link
              prefetch
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
              prefetch
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

          <form className='mt-8 space-y-6'>
            {authMethod === SignInType.WALLET &&
              (walletAddress ? (
                <>
                  {walletAddress ? (
                    <div className='mb-4 p-3 bg-gray-800 rounded-md'>
                      <p className='text-sm text-gray-300'>Connected wallet:</p>
                      <p className='text-xs text-gray-400 truncate'>
                        {walletAddress}
                      </p>
                    </div>
                  ) : (
                    <div className='text-center mb-4'>
                      <p className='text-gray-300'>
                        Connect your wallet to continue
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <TransactionBtn
                  onClickWithSigner={handleWalletConnect}
                  label='Wallet'
                  isLoading={isConnecting}
                  disabled={isConnecting}
                  loadingLabel='Connecting...'
                />
              ))}
            <div className='rounded-md grid grid-cols-2 shadow-sm gap-4'>
              {formRenderer}
            </div>

            {error && (
              <div className='text-red-500 text-sm text-center'>{error}</div>
            )}

            <div>
              {authMethod === SignInType.WALLET && walletAddress ? (
                <TransactionBtn
                  onClickWithSigner={handleWalletSignUp}
                  label='Create account'
                  isLoading={isConnecting}
                  disabled={isConnecting || !walletAddress}
                  loadingLabel='Creating account...'
                  type='submit'
                />
              ) : (
                <Button
                  label='Create account'
                  isLoading={isLoading}
                  disabled={
                    isLoading ||
                    (authMethod === SignInType.WALLET ? !walletAddress : false)
                  }
                  loadingLabel='Creating account...'
                  type='submit'
                  onClick={handleEmailSignUp}
                />
              )}
            </div>

            <div className='text-center'>
              <Link
                href='/auth/signin'
                prefetch
                className='text-primary-400 hover:text-primary-300'
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
