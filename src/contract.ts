'use client';
import { ethers, formatEther } from 'ethers';
import soulboundNftAbi from '@/abis/SooulboundNft.json';
import matchMakingAbi from '@/abis/MatchMaking.json';

import { Contract } from 'ethers';

interface EthereumProvider {
  request: (args: { method: string }) => Promise<string[]>;
  on: (event: string, callback: (...args: never[]) => void) => void;
  removeListener: (event: string, callback: (...args: never[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const getActiveAddress = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  const accounts = await window.ethereum.request({
    method: 'eth_accounts',
  });

  return accounts[0];
};

const checkIfValidAddressIsConnected = async () => {
  const savedWalletAddress = sessionStorage.getItem('savedWalletAddress');

  if (!savedWalletAddress) {
    return true;
  }

  const parsedWalletAddress = JSON.parse(savedWalletAddress || '');

  const accounts = await detectConnection();

  if (!accounts.length) {
    return true;
  }
  const activeWalletAddress = await getActiveAddress();
  if (!savedWalletAddress || parsedWalletAddress === activeWalletAddress) {
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
  if (!window.ethereum) {
    console.warn('MetaMask is not installed');
    return () => {};
  }

  // Add the listener
  window.ethereum.on('accountsChanged', callback);

  // Return a function to remove the listener
  return () => {
    window.ethereum?.removeListener('accountsChanged', callback);
  };
}

/**
 * Sets up a listener for chain changes in the wallet
 * @param callback Function to call when the chain changes
 * @returns A function to remove the listener when needed
 */
export function onChainChange(callback: (chainId: string) => void): () => void {
  if (!window.ethereum) {
    console.warn('MetaMask is not installed');
    return () => {};
  }

  // Add the listener
  window.ethereum.on('chainChanged', callback);

  // Return a function to remove the listener
  return () => {
    window.ethereum?.removeListener('chainChanged', callback);
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
    console.log('Change profile nft error', error);
    return false;
  }
};

export const likeProfile = async (
  contract: Contract | null,
  targetAddress: string
) => {
  if (!contract || !targetAddress) {
    return null;
  }
  try {
    const amount = await contract.s_amount();
    console.log('amount', amount);
    await contract.like(targetAddress, { value: amount });
  } catch (error: unknown) {
    console.log('like profile error', error);
    throw error;
  }
};

export const checkIfMatched = async (
  contract: Contract | null,
  address1: string,
  address2: string
) => {
  if (!contract || !address1 || !address2) {
    return null;
  }
  try {
    const like1 = await contract.s_likes(address1, address2);
    console.log('like1:', like1.like, like1);

    const like2 = await contract.s_likes(address2, address1);
    console.log('like2:', like2.like, like2);

    return like1.like && like2.like;
  } catch (error: unknown) {
    console.log('check if matched error', error);
    return false;
  }
};
