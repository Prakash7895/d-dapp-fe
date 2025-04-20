'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { connectWallet, onAccountChange } from '@/contract';
import { ethers } from 'ethers';
import Link from 'next/link';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { genderOptions, sexualOrientationOptions } from '@/utils';
import { UserFormData } from '@/types/user';
import Button from '@/components/Button';
import { toast } from 'react-toastify';
import { getUserLocation } from '@/userLocation';
import useSession from '@/hooks/useSession';
import axiosInstance from '@/apiCalls';

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
  const [authMethod, setAuthMethod] = useState<'email' | 'wallet'>('email');
  const [walletAddress, setWalletAddress] = useState('');
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  useEffect(() => {
    const removeAccountListener = onAccountChange((accounts) => {
      if (accounts?.[0]) {
        setWalletAddress(accounts[0]);
      }
    });

    return () => {
      removeAccountListener();
    };
  }, []);

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
      axiosInstance
        .post('/users', {
          ...formData,
          age: +formData.age,
          ...location,
        })
        .then(() => {
          router.push('/auth/signin?registered=true');
        })
        .catch((err) => {
          throw new Error(err.message || 'Failed to register');
        });

      // Redirect to sign in page
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred during registration'
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Connect wallet
      const walletResult = await connectWallet();
      const address = await walletResult.getAddress();

      if (!address) {
        throw new Error('Failed to connect wallet');
      }

      setWalletAddress(address);
      setAuthMethod('wallet');
    } catch (error) {
      setError('An error occurred while connecting wallet');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const message = `${process.env.NEXT_PUBLIC_MESSAGE_TO_VERIFY}${walletAddress}`;

      // Get the signer
      const provider = new ethers.BrowserProvider(window.ethereum!);
      console.log('provider', provider);
      const signer = await provider.getSigner();
      console.log('signer', signer);

      // Sign the message
      const signature = await signer.signMessage(message);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, email, ...restFormData } = formData;

      // Create user with wallet address
      axiosInstance
        .post('/users', {
          ...restFormData,
          age: +restFormData.age,
          walletAddress: walletAddress,
          signature,
          ...location,
        })
        .then((res) => {
          const data = res.data;
          toast.success(data?.message);
          router.push('/auth/signin?registered=true');
        })
        .catch((error) => {
          setError(
            error ? error.message : 'An error occurred during registration'
          );
          console.log(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
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
    ...(authMethod === 'email'
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

  const tabs = [
    {
      onClick: () => setAuthMethod('email'),
      label: 'Email & Password',
      isActive: authMethod === 'email',
    },
    {
      onClick: handleWalletConnect,
      label: 'Wallet',
      isActive: authMethod === 'wallet',
    },
  ].map((el) => (
    <button
      key={el.label}
      onClick={el.onClick}
      className={`px-4 py-2 rounded-md ${
        el.isActive ? 'bg-primary-500 text-white' : 'bg-gray-700 text-gray-300'
      }`}
    >
      {el.label}
    </button>
  ));

  return (
    <div className='flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-white'>
            Create your account
          </h2>
        </div>

        <div className='mt-8 space-y-6'>
          <div className='flex justify-center space-x-4 mb-6'>{tabs}</div>

          <form
            className='mt-8 space-y-6'
            onSubmit={
              authMethod === 'email' ? handleEmailSignUp : handleWalletSignUp
            }
          >
            {authMethod === 'wallet' && (
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
            )}
            <div className='rounded-md grid grid-cols-2 shadow-sm gap-4'>
              {formRenderer}
            </div>

            {error && (
              <div className='text-red-500 text-sm text-center'>{error}</div>
            )}

            <div>
              <Button
                label='Create account'
                isLoading={isLoading}
                disabled={
                  isLoading ||
                  (authMethod === 'wallet' ? !walletAddress : false)
                }
                loadingLabel='Creating account...'
                type='submit'
              />
            </div>

            <div className='text-center'>
              <Link
                href='/auth/signin'
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
