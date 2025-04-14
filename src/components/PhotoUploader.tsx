'use client';
import React, { FC, useState } from 'react';
import FileUploader from './FileUploader';
import { FILE_ACCESS } from '@/apiSchemas';
import { uploadPhoto } from '@/apiCalls';
import { toast } from 'react-toastify';
import { Modal, ModalBody, ModalContent, ModalTrigger } from './AnimatedModal';
import RadioButton from './RadioButton';
import { Upload } from 'lucide-react';

interface PhotoUploaderProps {
  onSuccess?: () => void;
}

const PhotoUploader: FC<PhotoUploaderProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState(FILE_ACCESS.PUBLIC);

  const accessRenderer = (
    <div className='flex items-center justify-around mb-7'>
      <RadioButton
        label='Public'
        value={FILE_ACCESS.PUBLIC}
        checked={access === FILE_ACCESS.PUBLIC}
        onChange={(val) => setAccess(val as FILE_ACCESS)}
      />
      <RadioButton
        label='Private'
        value={FILE_ACCESS.PRIVATE}
        checked={access === FILE_ACCESS.PRIVATE}
        onChange={(val) => setAccess(val as FILE_ACCESS)}
      />
    </div>
  );

  const onSubmit = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('access', access);

      setLoading(true);
      uploadPhoto(formData).then((res) => {
        if (res.status === 'success') {
          toast.success('Photo uploaded successfully!');
          onSuccess?.();
          setOpen(false);
        } else {
          toast.error('Error uploading Photo');
        }
        setLoading(false);
      });
    } catch (error) {
      console.log('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  return (
    <div>
      <Modal open={open} setOpen={setOpen}>
        <ModalTrigger className='text-white bg-primary-500 enabled:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all flex items-center gap-2'>
          <Upload /> Upload New Photo
        </ModalTrigger>
        <ModalBody className='max-w-[50%]'>
          <ModalContent>
            <FileUploader
              btnLabel='Upload'
              label='Upload Photo'
              onSubmit={onSubmit}
              isLoading={loading}
              contentAboveBtn={accessRenderer}
            />
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default PhotoUploader;
