'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { mintNewNft, getMintFee } from '@/contract';
import Button from './Button';
import { uploadFileWeb3Storage } from '@/web3Storage';
import FileUploader from './FileUploader';

export default function NftUploadMint({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [mintFee, setMintFee] = useState<number>(0);

  useEffect(() => {
    const loadMintFee = async () => {
      try {
        const fee = await getMintFee();
        if (fee) {
          setMintFee(fee?.mintFeeInEth);
        }
      } catch (error) {
        console.log('Error loading mint fee:', error);
        toast.error('Failed to load mint fee');
      }
    };

    loadMintFee();
  }, []);

  const handleMint = async (file: File) => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsLoading(true);
    uploadFileWeb3Storage(file)
      .then((res) => {
        console.log('res', res);
        if (res) {
          mintNewNft(res)
            .then((r) => {
              console.log('R', r);
              toast.success('Profile NFT minted successfully');
              setIsLoading(false);
              onSuccess();
            })
            .catch((err) => {
              setIsLoading(false);
              toast.error(err?.message || 'Error minting profile nft');
            });
        }
      })
      .catch((err) => {
        setIsLoading(false);
        toast.error(err?.message || 'Failed to upload file to web3 storage');
      });
  };

  return (
    <div className='bg-gray-900 rounded-lg shadow-xl p-6'>
      <h2 className='text-2xl font-bold text-white mb-6'>
        Mint Your Profile NFT
      </h2>

      <FileUploader
        btnLabel='Mint NFT'
        onSubmit={handleMint}
        isLoading={isLoading}
        label='Upload Profile Photo'
        contentAboveBtn={
          <div className='mb-6'>
            <p className='text-sm text-gray-400'>Minting Fee: {mintFee} ETH</p>
          </div>
        }
      />
    </div>
  );
}
