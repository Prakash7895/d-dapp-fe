'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { mintNewNft, getMintFee } from '@/contract';
import Button from './Button';
import { uploadFileWeb3Storage } from '@/web3Storage';

export default function NftUploadMint({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleMint = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsLoading(true);
    uploadFileWeb3Storage(selectedFile)
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

      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-300 mb-2'>
          Upload Profile Photo
        </label>
        <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg'>
          <div className='space-y-1 text-center'>
            {previewUrl ? (
              <div className='mb-4'>
                <img
                  src={previewUrl}
                  alt='Preview'
                  className='mx-auto h-32 w-32 object-cover rounded-full'
                />
              </div>
            ) : (
              <svg
                className='mx-auto h-12 w-12 text-gray-400'
                stroke='currentColor'
                fill='none'
                viewBox='0 0 48 48'
                aria-hidden='true'
              >
                <path
                  d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                  strokeWidth={2}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            )}
            <div className='flex text-sm text-gray-400'>
              <label
                htmlFor='file-upload'
                className='relative cursor-pointer bg-gray-800 rounded-md font-medium text-primary-500 hover:text-primary-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500'
              >
                <span>Upload a file</span>
                <input
                  id='file-upload'
                  name='file-upload'
                  type='file'
                  className='sr-only'
                  accept='image/*'
                  onChange={handleFileSelect}
                />
              </label>
              {/* <p className='pl-1'>or drag and drop</p> */}
            </div>
            <p className='text-xs text-gray-400'>PNG, JPG, GIF up to 5MB</p>
          </div>
        </div>
      </div>

      <div className='mb-6'>
        <p className='text-sm text-gray-400'>Minting Fee: {mintFee} ETH</p>
      </div>

      <Button
        label='Mint NFT'
        onClick={handleMint}
        disabled={!selectedFile || isLoading}
        isLoading={isLoading}
        loadingLabel='Minting NFT...'
      />
    </div>
  );
}
