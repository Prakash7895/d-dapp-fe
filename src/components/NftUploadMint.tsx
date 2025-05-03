'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { mintNewNft } from '@/contract';
import FileUploader from './FileUploader';
import { mintNFT } from '@/apiCalls';
import { useSoulboundNFTContract } from './EthereumProvider';
import { formatEther } from 'ethers';
import TransactionWrapper from './TransactionWrapper';
import Button from './Button';
import RadioButton from './RadioButton';
import { isValidCID, isValidIPFSGatewayLink } from '@/utils';

enum MintType {
  UPLOAD = 'upload',
  CID = 'cid',
}

export default function NftUploadMint({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [mintFee, setMintFee] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<MintType>(MintType.CID);
  const [cid, setCid] = useState<string>('');
  const [isCidValid, setIsCidValid] = useState(false);

  const soulboundNftContract = useSoulboundNFTContract();

  useEffect(() => {
    const loadMintFee = async () => {
      try {
        const mintFeeInWei = await soulboundNftContract?.s_mintFee();
        if (mintFeeInWei) {
          const mintFeeInEth = +formatEther(mintFeeInWei);
          if (mintFeeInEth) {
            setMintFee(mintFeeInEth);
          }
        }
      } catch (error) {
        console.log('Error loading mint fee:', error);
        toast.error('Failed to load mint fee');
      }
    };

    loadMintFee();
  }, [soulboundNftContract]);

  const validateInput = (value: string): boolean => {
    return isValidCID(value) || isValidIPFSGatewayLink(value);
  };

  const handleMint = async (file?: File) => {
    if (!soulboundNftContract) {
      toast.error('Soulbound NFT contract not found');
      return;
    }
    if (selectedOption === MintType.UPLOAD) {
      if (!file) {
        toast.error('Please select a file first');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      setIsLoading(true);
      mintNFT(formData)
        .then((res) => {
          if (res.status === 'success') {
            if (res.data?.metadataUrl) {
              mintNewNft(soulboundNftContract, res.data?.metadataUrl)
                .then((r) => {
                  toast.success('Profile NFT minted successfully');
                  setIsLoading(false);
                  onSuccess();
                })
                .catch((err) => {
                  setIsLoading(false);
                  toast.error(err?.message || 'Error minting profile nft');
                });
            }
          } else {
            toast.error(res.message);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          setIsLoading(false);
          toast.error(err?.message || 'Failed to upload file to web3 storage');
        });
    } else {
      if (!cid) {
        toast.error('Please enter a valid CID');
        return;
      }

      setIsLoading(true);
      mintNewNft(soulboundNftContract, cid)
        .then(() => {
          toast.success('Profile NFT minted successfully');
          setIsLoading(false);
          onSuccess();
        })
        .catch((err) => {
          setIsLoading(false);
          toast.error(err?.message || 'Error minting profile NFT');
        });
    }
  };

  const handleCidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCid(value);

    if (validateInput(value)) {
      setIsCidValid(true);
    } else {
      setIsCidValid(false);
    }
  };

  return (
    <div className='bg-gray-900 rounded-lg shadow-xl p-6'>
      <h2 className='text-2xl font-bold text-white mb-6'>
        Mint Your Profile NFT
      </h2>

      <div className='mb-6'>
        <p className='text-sm text-gray-400'>
          Choose how you want to mint your Profile NFT. You can either upload a
          new file or provide the CID of an existing NFT.
        </p>
        <div className='mt-4 flex items-center gap-4 justify-center'>
          <RadioButton
            label='Existing NFT'
            value={MintType.CID}
            checked={selectedOption === MintType.CID}
            onChange={(val) => setSelectedOption(val as MintType)}
          />
          <RadioButton
            label='Upload File'
            value={MintType.UPLOAD}
            checked={selectedOption === MintType.UPLOAD}
            onChange={(val) => setSelectedOption(val as MintType)}
          />
        </div>
      </div>

      {selectedOption === MintType.UPLOAD ? (
        <FileUploader
          btnLabel='Mint NFT'
          onSubmit={handleMint}
          isLoading={isLoading}
          label='Upload Profile Photo'
          contentAboveBtn={
            <div className='mb-6'>
              <p className='text-sm text-gray-400'>
                Minting Fee: {mintFee} ETH
              </p>
            </div>
          }
          withTransactionWrapper
        />
      ) : (
        <div className='mt-6'>
          <label className='block text-sm font-medium text-gray-300 mb-2'>
            Enter CID or IPFS gateway link of Existing NFT
          </label>
          <input
            type='text'
            value={cid}
            onChange={handleCidChange}
            placeholder='e.g., bafybeibwzif... or https://ipfs.io/ipfs/bafybeibwzif...'
            className={`w-full px-4 py-2 rounded-md bg-gray-800 text-gray-300 ${
              cid && !isCidValid ? 'border border-red-500' : ''
            } focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              cid && !isCidValid ? 'focus:!ring-red-500' : ''
            }`}
          />
          {cid && !isCidValid && (
            <p className='text-sm text-red-500 mt-2'>
              Please enter a valid CID or IPFS gateway link.
            </p>
          )}
          <TransactionWrapper
            disabled={!cid || !isCidValid}
            content={(disabled) => (
              <Button
                onClick={() => handleMint()}
                disabled={isLoading || disabled || !cid || !isCidValid}
                isLoading={isLoading}
                className={`mt-4 w-full px-4 py-2 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Minting...' : 'Mint NFT'}
              </Button>
            )}
          />
        </div>
      )}
    </div>
  );
}
