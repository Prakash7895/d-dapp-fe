import SignUpForm from '@/components/SignUpForm';
import React from 'react';


const SignUp = () => {
  return (
    <div className='h-full flex justify-center items-center'>
      <div className='flex flex-col'>
        <h3 className='text-4xl font-bold text-center mb-6'>
          Welcome to our Dating Dapp!
        </h3>
        <p className='text-lg text-center mb-6'>
          Find your perfect match on the blockchain.
        </p>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;
