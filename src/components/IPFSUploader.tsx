import React, { FC, useState } from 'react';
import { FileUploader } from './FileUploader';
import { addFileToWeb3Storage } from '@/web3Storage';
import { toast } from 'react-toastify';
import { mintNewNft } from '@/utils';
import Loader from './Loader';

interface IPFSUploaderProps {
  onSuccess: () => void;
}

const IPFSUploader: FC<IPFSUploaderProps> = ({ onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File>();

  const handleUpload = (file: File) => {
    setUploading(true);
    addFileToWeb3Storage(file)
      .then((res) => {
        console.log('res', res);
        if (res) {
          mintNewNft(res)
            .then((r) => {
              console.log('R', r);
              toast.success('Profile NFT minted successfully');
              setUploading(false);
              onSuccess();
            })
            .catch((err) => {
              setUploading(false);
              toast.error(err?.message || 'Error minting profile nft');
            });
        }
      })
      .catch((err) => {
        setUploading(false);
        toast.error(err?.message || 'Failed to upload file to web3 storage');
      });
  };

  return (
    <div>
      <FileUploader
        onChange={(files) => {
          if (files[0]) {
            setFile(files[0]);
          }
        }}
        actions={
          uploading ? (
            <Loader />
          ) : (
            <button
              onClick={() => file && handleUpload(file)}
              disabled={uploading}
              className='relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50'
            >
              <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]' />
              <span className='inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl'>
                Mint Soulbound NFT
              </span>
            </button>
          )
        }
      />
    </div>
  );
};

export default IPFSUploader;
