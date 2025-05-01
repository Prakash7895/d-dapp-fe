'use client';
import { useState, ReactNode } from 'react';
import { toast } from 'react-toastify';
import Button from './Button';
import TransactionWrapper from './TransactionWrapper';

interface FileUploaderProps {
  label?: string;
  contentAboveBtn?: ReactNode;
  btnLabel?: string;
  onSubmit: (file: File) => void;
  isLoading?: boolean;
  preview?: string;
  isEditing?: boolean;
  withTransactionWrapper?: boolean;
}

export default function FileUploader({
  label,
  contentAboveBtn,
  btnLabel,
  onSubmit,
  isLoading,
  preview,
  isEditing,
  withTransactionWrapper,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview ?? null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  return (
    <div>
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-300 mb-2'>
          {label}
        </label>
        <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg'>
          <div className='space-y-1 text-center'>
            {previewUrl ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt='Preview'
                  className='mx-auto h-32 w-32 object-cover rounded-md'
                />
              </div>
            ) : (
              <svg
                className='mx-auto h-12 w-12 text-gray-400'
                stroke='currentColor'
                fill='none'
                viewBox='0 0 48 48'
                aria-hidden='true'
              >
                <path
                  d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                  strokeWidth={2}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            )}
            {!isEditing && (
              <>
                <div className='flex text-sm text-gray-400 mt-4'>
                  <label
                    htmlFor='file-upload'
                    className='relative cursor-pointer mx-auto bg-gray-800 rounded-md font-medium text-primary-500 hover:text-primary-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500'
                  >
                    <span>Upload a file</span>
                    <input
                      id='file-upload'
                      name='file-upload'
                      type='file'
                      className='sr-only'
                      accept='image/*'
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
                <p className='text-xs text-gray-400'>PNG, JPG, GIF up to 5MB</p>
              </>
            )}
          </div>
        </div>
      </div>

      {contentAboveBtn}
      {withTransactionWrapper && selectedFile ? (
        <TransactionWrapper
          content={(disabled) => (
            <Button
              label={btnLabel}
              onClick={() => onSubmit(selectedFile!)}
              disabled={
                disabled || (isEditing ? isLoading : !selectedFile || isLoading)
              }
              isLoading={isLoading}
            />
          )}
        />
      ) : (
        <Button
          label={btnLabel}
          onClick={() => onSubmit(selectedFile!)}
          disabled={isEditing ? isLoading : !selectedFile || isLoading}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
