import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { pinata } from '../../utils/config';

const MintNFT = () => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File>();
  const [uploadedFile, setUploadedFile] = useState<string>();

  const uploadToPinata = async (file: File, url: string) => {
    const upload = await pinata.upload.public.file(file).url(url);
    console.log('upload:', upload);
    const fileUrl = await pinata.gateways.public.convert(upload.cid);
    console.log('fileUrl:', fileUrl);
    setUploadedFile(fileUrl as unknown as string);
    setUploading(false);
  };

  const handleUpload = (file: File) => {
    setUploading(true);
    fetch('/api/get-signed-url')
      .then((res) => res.json())
      .then((res) => {
        console.log('RES', res);
        uploadToPinata(file, res.url);
      })
      .catch((err) => {
        console.log('ERR', err);
      });
  };

  return (
    <div>
      {uploadedFile ? (
        <div>
          <img alt='Soulbound NFT' src={uploadedFile} />
        </div>
      ) : (
        <FileUploader
          onChange={(files) => {
            if (files[0]) {
              setFile(files[0]);
            }
          }}
          actions={
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
          }
        />
      )}
    </div>
  );
};

export default MintNFT;
