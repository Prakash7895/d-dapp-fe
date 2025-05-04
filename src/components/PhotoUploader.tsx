'use client';
import React, { FC, ReactNode, useState } from 'react';
import FileUploader from './FileUploader';
import { FILE_ACCESS } from '@/apiSchemas';
import { udpateFileAccess, uploadPhoto } from '@/apiCalls';
import { toast } from 'react-toastify';
import { Modal, ModalBody, ModalContent, ModalTrigger } from './AnimatedModal';
import RadioButton from './RadioButton';
import { Upload } from 'lucide-react';

interface PhotoUploaderProps {
  onSuccess?: () => void;
  trigger?: ReactNode;
  triggerClassName?: string;
  isEditing?: boolean;
  editData?: { url: string; access: FILE_ACCESS; fileId: number };
}

const PhotoUploader: FC<PhotoUploaderProps> = ({
  onSuccess,
  trigger,
  triggerClassName,
  isEditing = false,
  editData,
}) => {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState(editData?.access ?? FILE_ACCESS.PUBLIC);

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

  const onSubmit = async (file: File | null) => {
    if (!file) {
      return;
    }
    try {
      const formData = new FormData();
      if (!isEditing) {
        formData.append('file', file);
      }
      formData.append('access', access);

      setLoading(true);
      (isEditing
        ? udpateFileAccess(editData!.fileId!, access)
        : uploadPhoto(formData)
      ).then((res) => {
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
        {trigger ? (
          <ModalTrigger className={triggerClassName}> {trigger}</ModalTrigger>
        ) : (
          <ModalTrigger className='text-white bg-primary-500 enabled:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all flex items-center gap-2'>
            <Upload /> Upload New Photo
          </ModalTrigger>
        )}
        <ModalBody className='max-w-[50%]'>
          <ModalContent>
            <FileUploader
              btnLabel='Upload'
              label='Upload Photo'
              onSubmit={onSubmit}
              isLoading={loading}
              contentAboveBtn={accessRenderer}
              preview={editData?.url}
              isEditing={isEditing}
            />
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default PhotoUploader;
