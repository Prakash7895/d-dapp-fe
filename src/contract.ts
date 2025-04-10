'use client';
import { ethers, formatEther } from 'ethers';
import soulboundNftAbi from '@/abis/SooulboundNft.json';
import { Contract } from 'ethers';

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

      return accounts;
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

      const signer = await provider.getSigner();

      return signer;
    } catch (err) {
      console.error('User rejected the request', err);
      throw err;
    }
  }
}

const getSoulboundNft = async () => {
  try {
    const signer = await connectWallet();

    return new ethers.Contract(
      process.env.NEXT_PUBLIC_SOULBOUND_NFT_ADDRESS!,
      soulboundNftAbi,
      signer
    );
  } catch (error: any) {
    console.log('getting SoulboundNft instance error', error);
    return false;
  }
};

export const getMintFee = async () => {
  try {
    const soulboundNft = (await getSoulboundNft()) as Contract;

    const mintFeeInWei = await soulboundNft.s_mintFee();
    const mintFeeInEth = +formatEther(mintFeeInWei);

    return {
      mintFeeInWei,
      mintFeeInEth,
    };
  } catch (error: any) {
    console.log('getting mint fee error', error);
    return false;
  }
};

export const mintNewNft = async (tokenUri: string) => {
  try {
    const soulboundNft = (await getSoulboundNft()) as Contract;
    const fees = await getMintFee();

    if (!fees) {
      throw new Error('Failed to get mint fee');
    }

    const transaction = await soulboundNft.createUserProfile(tokenUri, {
      value: fees.mintFeeInWei,
    });
    await transaction.wait();
  } catch (error: any) {
    console.log('minting new Nft error', error);
    return false;
  }
};

export const getActiveProfileNft = async () => {
  try {
    const signer = await connectWallet();
    const soulboundNft = (await getSoulboundNft()) as Contract;

    const metaDataUri = await soulboundNft.getActiveProfileNft(signer.address);

    const response = await fetch(metaDataUri);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    const metaData = await response.json();

    const imageUrl = metaData?.image_gateway;

    if (!imageUrl) {
      throw new Error('Image URL not found in metadata');
    }

    return imageUrl;
  } catch (error: any) {
    console.log('getting active profile nft error', error);
    return false;
  }
};

export const getUserTokenUris = async () => {
  try {
    const signer = await connectWallet();
    const soulboundNft = (await getSoulboundNft()) as Contract;

    const tokenUris = await soulboundNft.getUserTokenUris(signer.address);

    return Array.from(tokenUris);
  } catch (error: any) {
    console.log('get user token uris error', error);
    return false;
  }
};

export const getUserTokenIds = async () => {
  try {
    const signer = await connectWallet();
    const soulboundNft = (await getSoulboundNft()) as Contract;

    const tokenIds = await soulboundNft.getUserNfts(signer.address);

    const ids = Array.from(tokenIds).map((el) => Number(el));

    return ids;
  } catch (error: any) {
    console.log('get user token ids error', error);
    return false;
  }
};

export const getUserTokenUriById = async (id: number) => {
  try {
    const soulboundNft = (await getSoulboundNft()) as Contract;

    const metaDataUri = await soulboundNft.tokenURI(id);

    const response = await fetch(metaDataUri);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    const metaData = await response.json();

    const imageUrl = metaData?.image_gateway;

    if (!imageUrl) {
      throw new Error('Image URL not found in metadata');
    }

    return imageUrl;
  } catch (error: any) {
    console.log('Get token uri by id error', error);
    return false;
  }
};

export const changeProfileNft = async (tokenId: number) => {
  try {
    const soulboundNft = (await getSoulboundNft()) as Contract;

    const transaction = await soulboundNft.changeProfileNft(tokenId);
    await transaction.wait();

    return true;
  } catch (error: any) {
    console.log('get user token ids error', error);
    return false;
  }
};
