'use client';
import { ethers, formatEther } from 'ethers';
import soulboundNftAbi from '@/abis/SooulboundNft.json';
import { Contract } from 'ethers';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const getActiveAddress = async () => {
  const accounts = await window.ethereum.request({
    method: 'eth_accounts',
  });

  return accounts[0];
};

const checkIfValidAddressIsConnected = async () => {
  const savedWalletAddress = sessionStorage.getItem('savedWalletAddress');
  const activeWalletAddress = await getActiveAddress();
  if (savedWalletAddress === activeWalletAddress) {
    return true;
  }
  throw new Error('Saved wallet address is not active');
};

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
      console.log('User rejected the request', err);
      throw err;
    }
  }
}

export async function connectWallet() {
  if (window.ethereum == null || typeof window.ethereum == 'undefined') {
    throw new Error('Please install MetaMask to use this dApp!');
  } else {
    try {
      await checkIfValidAddressIsConnected();
      const provider = new ethers.BrowserProvider(window.ethereum);

      const signer = await provider.getSigner();

      return signer;
    } catch (err) {
      console.log('User rejected the request', err);
      throw err;
    }
  }
}

/**
 * Sets up a listener for account changes in the wallet
 * @param callback Function to call when the account changes
 * @returns A function to remove the listener when needed
 */
export function onAccountChange(
  callback: (accounts: string[]) => void
): () => void {
  if (window.ethereum == null || typeof window.ethereum == 'undefined') {
    console.warn('MetaMask is not installed');
    return () => {};
  }

  // Add the listener
  window.ethereum.on('accountsChanged', callback);

  // Return a function to remove the listener
  return () => {
    window.ethereum.removeListener('accountsChanged', callback);
  };
}

/**
 * Sets up a listener for chain changes in the wallet
 * @param callback Function to call when the chain changes
 * @returns A function to remove the listener when needed
 */
export function onChainChange(callback: (chainId: string) => void): () => void {
  if (window.ethereum == null || typeof window.ethereum == 'undefined') {
    console.warn('MetaMask is not installed');
    return () => {};
  }

  // Add the listener
  window.ethereum.on('chainChanged', callback);

  // Return a function to remove the listener
  return () => {
    window.ethereum.removeListener('chainChanged', callback);
  };
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
