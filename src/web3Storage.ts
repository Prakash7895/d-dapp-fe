'use client';
import { create } from '@web3-storage/w3up-client';

// Define the Web3Storage interface
interface Web3Storage {
  uploadFile: (file: File) => Promise<string>;
}

// Create a singleton instance
let web3StorageInstance: Web3Storage | null = null;

// Initialize the Web3Storage client
const initializeWeb3Storage = async (): Promise<Web3Storage> => {
  if (web3StorageInstance) {
    return web3StorageInstance;
  }

  try {
    const client = await create();
    const email = process.env.NEXT_PUBLIC_W3S_EMAIL;

    const allAccounts = client.accounts();

    if (!Object.keys(allAccounts).length) {
      const account = await client.login(email as `${string}@${string}`);
      const space = await client.createSpace('dating-dapp-space', { account });
      await client.setCurrentSpace(space.did());
    }

    const storage: Web3Storage = {
      uploadFile: async (file: File): Promise<string> => {
        try {
          const uploadedFile = await client.uploadFile(file);
          const cid = uploadedFile?.toString();
          const metaDataFile = createNFTMetadataFile(cid?.toString()!);
          const uploadedMetaFile = await client.uploadFile(metaDataFile);
          const metaCID = uploadedMetaFile?.toString();
          console.log('MetaCID', metaCID);
          return `https://${metaCID}.ipfs.w3s.link`;
        } catch (error) {
          console.error('Error uploading file to Web3Storage:', error);
          throw error;
        }
      },
    };

    web3StorageInstance = storage;
    return storage;
  } catch (err) {
    console.error('registration failed: ', err);
    throw err;
  }
};

// Export a function to get the Web3Storage instance
export const getWeb3Storage = async (): Promise<Web3Storage> => {
  return await initializeWeb3Storage();
};

// Export the upload functions for convenience
export const uploadFileWeb3Storage = async (file: File): Promise<string> => {
  const storage = await getWeb3Storage();
  return storage.uploadFile(file);
};

export const createNFTMetadataFile = (imageCID: string): File => {
  const id = sessionStorage.getItem('id');
  const metadata = {
    name: 'Profile NFT',
    description: 'A profile NFT stored on IPFS',
    image: `ipfs://${imageCID}`,
    image_gateway: `https://${imageCID}.ipfs.w3s.link`,
    id,
  };

  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: 'application/json',
  });
  const fileName = `${new Date().getTime()}.json`;

  return new File([blob], fileName, { type: 'application/json' });
};
