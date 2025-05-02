'use client';
import { Contract, parseEther } from 'ethers';
import { toast } from 'react-toastify';

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

const handleTransactionError = (error: any) => {
  if (error?.code === -32603) {
    if (error.message.includes('insufficient funds')) {
      toast.error('Insufficient funds to complete transaction');
    } else if (error.message.includes('user rejected')) {
      toast.error('Transaction rejected by user');
    } else {
      toast.error(
        'Transaction failed. Please check your wallet balance and try again'
      );
    }
  }
  if (error.reason) {
    console.log('Revert reason:', error.reason);
    toast.error(`Transaction failed: ${error.reason}`);
  } else if (error.data?.message) {
    console.log('Error message:', error.data.message);
    toast.error(`Transaction failed: ${error.data.message}`);
  } else if (error.message) {
    console.log('Error message:', error.message);
    toast.error(`Transaction failed: ${error.message}`);
  } else {
    toast.error('Transaction failed. Please try again.');
  }
};

export const likeProfile = async (
  contract: Contract | null,
  targetAddress: string
) => {
  if (!contract || !targetAddress) {
    console.log('Contract or target address is null');
    return null;
  }
  try {
    const amount = await contract.s_amount();
    console.log('amount', amount);
    await contract.like(targetAddress, { value: amount });
  } catch (error: unknown) {
    console.log('like profile error', error);
    handleTransactionError(error);
    throw error;
  }
};

export const unlikeProfile = async (
  contract: Contract | null,
  user1: string,
  user2: string
) => {
  if (!contract || !user1 || !user2) {
    console.log('Contract or user addresses are null');
    return null;
  }
  try {
    await contract.unSetLikeOnExpiration(user1, user2);
  } catch (error: any) {
    console.log('unlike profile error', error);
    handleTransactionError(error);
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

export const mintNewNft = async (
  contract: Contract | null,
  tokenUri: string
) => {
  if (!contract || !tokenUri) {
    console.log('Contract or tokenUri is null');
    return null;
  }
  try {
    const mintFeeInWei = await contract.s_mintFee();

    if (!mintFeeInWei) {
      throw new Error('Failed to get mint fee');
    }

    const transaction = await contract.createUserProfile(tokenUri, {
      value: mintFeeInWei,
    });
    await transaction.wait();

    return true;
  } catch (error: unknown) {
    handleTransactionError(error);
    console.log('minting new Nft error', error);
    return false;
  }
};

export const getActiveProfileNft = async (
  contract: Contract | null,
  address: string | null
) => {
  if (!contract || !address) {
    console.log('Contract or address is null');
    return null;
  }
  try {
    console.log('getting active profile nft');

    let metaDataUri = await contract.getActiveProfileNft(address);

    if (
      !metaDataUri.startsWith('http://') &&
      !metaDataUri.startsWith('https://')
    ) {
      metaDataUri = `https://${metaDataUri}.ipfs.w3s.link`;
    }

    const response = await fetch(metaDataUri);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    // Check the Content-Type header
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      // Handle JSON response
      const metaData = await response.json();
      console.log('Metadata:', metaData);

      const imageUrl = metaData?.image_gateway;
      if (!imageUrl) {
        throw new Error('Image URL not found in metadata');
      }
      return imageUrl;
    } else if (contentType.includes('image/')) {
      // Handle image response
      const imageUrl = metaDataUri; // The URI itself is the image URL
      return imageUrl;
    } else {
      throw new Error('Unsupported content type');
    }
  } catch (error: unknown) {
    console.log('getting active profile nft error', error);
    return false;
  }
};

export const getUserTokenIds = async (
  contract: Contract | null,
  address: string | null
) => {
  if (!contract || !address) {
    console.log('Contract or address is null');
    return null;
  }
  try {
    console.log('getting user token ids');

    const tokenIds = await contract.getUserNfts(address);

    const ids = Array.from(tokenIds).map((el) => Number(el));

    return ids;
  } catch (error: unknown) {
    console.log('get user token ids error', error);
    return false;
  }
};

export const changeProfileNft = async (
  contract: Contract | null,
  tokenId: number
) => {
  if (!contract) {
    console.log('Contract is null');
    return null;
  }
  try {
    const transaction = await contract.changeProfileNft(tokenId);
    await transaction.wait();

    return true;
  } catch (error: unknown) {
    handleTransactionError(error);
    console.log('Change profile nft error', error);
    return false;
  }
};

export const getUserTokenUriById = async (
  contract: Contract | null,
  id: number
) => {
  if (!contract) {
    console.log('Contract is null');
    return null;
  }
  try {
    let metaDataUri = await contract.tokenURI(id);

    if (
      !metaDataUri.startsWith('http://') &&
      !metaDataUri.startsWith('https://')
    ) {
      metaDataUri = `https://${metaDataUri}.ipfs.w3s.link`;
    }

    const response = await fetch(metaDataUri);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    // Check the Content-Type header
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      // Handle JSON response
      const metaData = await response.json();
      console.log('Metadata:', metaData);

      const imageUrl = metaData?.image_gateway;
      if (!imageUrl) {
        throw new Error('Image URL not found in metadata');
      }
      return imageUrl;
    } else if (contentType.includes('image/')) {
      // Handle image response
      const imageUrl = metaDataUri; // The URI itself is the image URL
      return imageUrl;
    } else {
      throw new Error('Unsupported content type');
    }
  } catch (error: unknown) {
    console.log('Get token uri by id error', error);
    return false;
  }
};

export const submitMultiSigProposal = async (
  contract: Contract | null,
  destination: string,
  amount: string
) => {
  if (!contract) {
    console.log('Contract is null');
    return null;
  }
  try {
    const tx = await contract.submitProposal(destination, parseEther(amount));
    await tx.wait();
  } catch (error: any) {
    console.log('submit proposal error', error);
    handleTransactionError(error);
    throw error;
  }
};

export const approveMultiSigProposal = async (
  contract: Contract | null,
  index: number
) => {
  if (!contract) {
    console.log('Contract is null');
    return null;
  }
  try {
    const tx = await contract.approveProposal(index);
    await tx.wait();
  } catch (error: any) {
    console.log('approve proposal error', error);
    handleTransactionError(error);
    throw error;
  }
};

export const inactivateMultiSigProposal = async (
  contract: Contract | null,
  index: number
) => {
  if (!contract) {
    console.log('Contract is null');
    return null;
  }
  try {
    const tx = await contract.inactivateProposal(index);
    await tx.wait();
  } catch (error: any) {
    console.log('inactivate proposal error', error);
    handleTransactionError(error);
    throw error;
  }
};
