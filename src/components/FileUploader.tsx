import { cn } from '@/lib/utils';
import React, { ReactNode, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { IconUpload } from '@tabler/icons-react';
import { useDropzone } from 'react-dropzone';
import GridPattern from './GridPattern';

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUploader = ({
  onChange,
  actions,
}: {
  onChange?: (files: File[]) => void;
  actions?: ReactNode;
}) => {
  const [files, setFiles] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles[0]);
    onChange && onChange(newFiles);
  };

  const handleClick = () => {
    !files && fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className='w-full' {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover='animate'
        className='p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden'
      >
        <input
          ref={fileInputRef}
          id='file-upload-handle'
          type='file'
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className='hidden'
          multiple={false}
        />
        <div className='absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]'>
          <GridPattern />
        </div>
        <div className='flex flex-col items-center justify-center'>
          {files ? (
            <div className='relative bg-white dark:bg-neutral-900'>
              <img
                src={URL.createObjectURL(files)}
                alt='Uploaded image'
                className='h-20 '
              />
            </div>
          ) : (
            <div>
              <p className='relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base'>
                Upload
              </p>
              <p className='relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2'>
                Drag or drop your files here or click to upload
              </p>
            </div>
          )}
          <div className='relative w-full mt-10 max-w-xl mx-auto'>
            {files &&
              [files].map((file, idx) => (
                <motion.div
                  key={'file' + idx}
                  layoutId={idx === 0 ? 'file-upload' : 'file-upload-' + idx}
                  className={cn(
                    'relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex items-center justify-between md:h-24 p-4 mt-4 w-full mx-auto rounded-md',
                    'shadow-sm'
                  )}
                >
                  <div className='flex flex-col justify-between w-full items-start gap-4'>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className='text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs'
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className='rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input'
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div className='flex text-sm flex-col items-end w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400'>
                    {actions}
                  </div>
                </motion.div>
              ))}
            {!files && (
              <motion.div
                layoutId='file-upload'
                variants={mainVariant}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  'relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md',
                  'shadow-[0px_10px_50px_rgba(0,0,0,0.1)]'
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='text-neutral-600 flex flex-col items-center'
                  >
                    Drop it
                    <IconUpload className='h-4 w-4 text-neutral-600 dark:text-neutral-400' />
                  </motion.p>
                ) : (
                  <IconUpload className='h-4 w-4 text-neutral-600 dark:text-neutral-300' />
                )}
              </motion.div>
            )}

            {!files && (
              <motion.div
                variants={secondaryVariant}
                className='absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md'
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
