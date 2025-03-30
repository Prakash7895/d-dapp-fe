'use client';
import React, { useEffect, useState } from 'react';
import { useStateContext } from './StateProvider';
import { connectWallet, detectConnection } from '@/utils';
import MintNFT from './MintNFT';

const Signup = () => {
  const { setAccounts } = useStateContext();

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    detectConnection()
      .then((res) => {
        console.log('RES', res);
        if (res.accounts.length > 0) {
          setConnected(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const connect = () => {
    connectWallet().then((res) => {
      console.log('RES', res);
      setAccounts(res.accounts);
      if (res.accounts.length > 0) {
        setConnected(true);
      }
    });
  };

  return (
    <div className='flex flex-col'>
      <h3 className='text-4xl font-bold text-center mb-6'>
        Welcome to our Dating Dapp!
      </h3>
      <p className='text-lg text-center mb-6'>
        Find your perfect match on the blockchain.
      </p>

      {!connected ? (
        <button className='p-[3px] relative mx-auto'>
          <div className='absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg' />
          <div
            onClick={connect}
            className='px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent'
          >
            Sign Up with MetaMask
          </div>
        </button>
      ) : (
        <p className='text-center'>Mint your profile NFT to sign up</p>
      )}
      <div className='border-[1px] rounded-xl border-gray-800 border-dashed mt-5'>
        <MintNFT />
      </div>
    </div>
  );
};

export default Signup;
