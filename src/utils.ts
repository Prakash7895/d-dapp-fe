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
  await transaction.wait();

  console.log('transaction', transaction);
};

export const getActiveProfileNft = async () => {
  const signer = await connectWallet();
  const soulboundNft = await getSoulboundNft();

  const transaction = await soulboundNft.getActiveProfileNft(signer.address);
  console.log('transaction', transaction);
};

export const getUserTokenUris = async () => {
  const signer = await connectWallet();
  const soulboundNft = await getSoulboundNft();

  const tokenUris = await soulboundNft.getUserTokenUris(signer.address);

  console.log('tokenUris', Array.from(tokenUris));

  return Array.from(tokenUris);
};

export const getUserTokenIds = async () => {
  const signer = await connectWallet();
  const soulboundNft = await getSoulboundNft();

  const tokenIds = await soulboundNft.getUserNfts(signer.address);

  const ids = Array.from(tokenIds).map((el) => Number(el));

  return ids;
};

export const getUserTokenUriById = async (id: number) => {
  try {
    const soulboundNft = await getSoulboundNft();

    const tokenUri = await soulboundNft.tokenURI(id);

    console.log(id, '=>', tokenUri);

    return tokenUri;
  } catch (error: any) {
    if (
      error.code === -32000 ||
      error.code === 3 ||
      error.message.includes('execution reverted')
    ) {
      console.log('Transaction failed: Invalid tokenId or conditions not met.');
    } else {
      console.log('An unexpected error occurred:');
    }
    return false;
  }
};
