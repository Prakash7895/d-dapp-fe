'use client';
import { create } from '@web3-storage/w3up-client';

const initializeWeb3Storage = async () => {
  try {
    const client = await create();
    const allAccounts = client.accounts();

    if (!Object.keys(allAccounts).length) {
      const account = await client.login('prakashchoudhary0141@gmail.com');
      const space = await client.createSpace('dating-dapp-space', { account });
      await client.setCurrentSpace(space.did());
    }

    return client;
  } catch (err) {
    console.error('registration failed: ', err);
    return null;
  }
};

const web3Client = await initializeWeb3Storage();

export const addFileToWeb3Storage = async (file: File) => {
  try {
    const uploadedFile = await web3Client?.uploadFile(file);
    const cid = uploadedFile?.toString();

    const metaDataFile = createNFTMetadataFile(cid?.toString()!);
    const uploadedMetaFile = await web3Client?.uploadFile(metaDataFile);
    return uploadedMetaFile?.toString();
  } catch (err) {
    console.error('failed to upload file: ', err);
    return false;
  }
};

export const createNFTMetadataFile = (imageCID: string): File => {
  const metadata = {
    name: 'Profile NFT',
    description: 'A profile NFT stored on IPFS',
    image: `ipfs://${imageCID}`,
    image_gateway: `https://${imageCID}.ipfs.w3s.link`,
  };

  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: 'application/json',
  });
  const fileName = `${new Date().getTime()}.json`;

  return new File([blob], fileName, { type: 'application/json' });
};
