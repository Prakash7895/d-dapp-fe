'use client';
import React, { useState } from 'react';
import FileUploader from './FileUploader';
import { FILE_ACCESS } from '@/apiSchemas';
import { uploadPhoto } from '@/apiCalls';
import { toast } from 'react-toastify';
import { Modal, ModalBody, ModalContent, ModalTrigger } from './AnimatedModal';
import RadioButton from './RadioButton';

const PhotoUploader = () => {
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
        <ModalTrigger className={'Hello'}>{'trigger'}</ModalTrigger>
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
