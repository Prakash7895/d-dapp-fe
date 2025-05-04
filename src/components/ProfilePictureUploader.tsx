'use client';
import React, { FC, ReactNode, useState } from 'react';
import { Modal, ModalBody, ModalContent, ModalTrigger } from './AnimatedModal';
import FileUploader from './FileUploader';
import { uploadProfilePicture } from '@/apiCalls';
import { toast } from 'react-toastify';
import { useStateContext } from './StateProvider';

interface ProfilePictureUploaderProps {
  triggerClassName?: string;
  trigger?: ReactNode;
}

const ProfilePictureUploader: FC<ProfilePictureUploaderProps> = ({
  trigger,
  triggerClassName,
}) => {
  const [open, setOpen] = useState(false);
  const { setUserInfo } = useStateContext();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (file: File | null) => {
    if (!file) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);

      setLoading(true);
      uploadProfilePicture(formData).then((res) => {
        if (res.status === 'success') {
          toast.success('Photo uploaded successfully!');
          setOpen(false);
          setUserInfo(res.data!);
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
    <Modal open={open} setOpen={setOpen}>
      <ModalTrigger className={triggerClassName}>{trigger}</ModalTrigger>
      <ModalBody className='max-w-[50%]'>
        <ModalContent>
          <FileUploader
            btnLabel='Upload'
            label='Upload Photo'
            onSubmit={onSubmit}
            isLoading={loading}
          />
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

export default ProfilePictureUploader;
