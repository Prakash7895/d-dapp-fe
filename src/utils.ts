'use client';
import { ethers, formatEther } from 'ethers';
import soulboundNftAbi from '@/abis/SooulboundNft.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function detectConnection() {
  // TODO: need to handle this case
  if (window.ethereum == null || typeof window.ethereum == 'undefined') {
    throw new Error('Please install MetaMask to use this dApp!');
  } else {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      return {
        accounts,
      };
    } catch (err) {
      console.error('User rejected the request', err);
      throw err;
    }
  }
}

export async function connectWallet() {
  if (window.ethereum == null || typeof window.ethereum == 'undefined') {
    throw new Error('Please install MetaMask to use this dApp!');
  } else {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      // console.log('provider', provider);

      const signer = await provider.getSigner();
      // console.log(signer);
      // console.log(provider);

      return signer;
    } catch (err) {
      console.error('User rejected the request', err);
      throw err;
    }
  }
}

const getSoulboundNft = async () => {
  const signer = await connectWallet();

  return new ethers.Contract(
    process.env.NEXT_PUBLIC_SOULBOUND_NFT_ADDRESS!,
    soulboundNftAbi,
    signer
  );
};

export const getMintFee = async () => {
  const soulboundNft = await getSoulboundNft();

  const mintFeeInWei = await soulboundNft.s_mintFee();
  const mintFeeInEth = +formatEther(mintFeeInWei);

  return {
    mintFeeInWei,
    mintFeeInEth,
  };
};

export const mintNewNft = async (tokenUri: string) => {
  const soulboundNft = await getSoulboundNft();
  const fees = await getMintFee();

  console.log('tokenUri', tokenUri);
  console.log('fees', fees);

  const transaction = await soulboundNft.createUserProfile(tokenUri, {
    value: fees.mintFeeInWei,
  });
  // await transaction.wait();

  console.log('transaction', transaction);
};
