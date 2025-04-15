'use client';
import { useEffect, useState } from 'react';
import { S3File, useUserFiles } from '@/hooks/useUserFiles';
import {
  Image as ImageIcon,
  Trash2,
  Loader2,
  Edit2,
  Lock,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Loader from './Loader';
import PhotoUploader from './PhotoUploader';
import { FILE_ACCESS } from '@/apiSchemas';
import AnimatedTooltip from './AnimatedTooltip';

interface FileCardProps {
  file: S3File;
  onDelete: (id: number) => Promise<void>;
  refresh: () => void;
}

function FileCard({ file, onDelete, refresh }: FileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(file.id);
      toast.success('File deleted successfully');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to delete file');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='relative group'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='aspect-square rounded-lg overflow-hidden bg-gray-100'>
        <img
          src={file.url}
          alt={file.key}
          className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
        />

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='absolute inset-0 bg-black/50 flex items-center justify-center gap-2'
            >
              <PhotoUploader
                isEditing={true}
                onSuccess={refresh}
                trigger={<Edit2 className='w-5 h-5' />}
                triggerClassName='p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600'
                editData={{
                  url: file.url,
                  access: file.access,
                  fileId: file.id,
                }}
              />
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className='p-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50'
              >
                {isDeleting ? (
                  <Loader2 className='w-5 h-5 animate-spin' />
                ) : (
                  <Trash2 className='w-5 h-5' />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className='mt-2'>
        <div className='flex items-center justify-between gap-2 text-sm'>
          <span className='text-gray-400'>
            {new Date(file.createdAt).toLocaleDateString()}
          </span>
          {file.access === FILE_ACCESS.PRIVATE ? (
            <AnimatedTooltip
              tooltipContent={
                <>
                  <p>Private</p>
                  <small>Visible to matched users only</small>
                </>
              }
            >
              <Lock className='text-gray-400' size={14} />
            </AnimatedTooltip>
          ) : (
            <AnimatedTooltip
              tooltipContent={
                <>
                  <p>Public</p>
                  <small>Visible to everyone</small>
                </>
              }
            >
              <Globe className='text-gray-400' size={14} />
            </AnimatedTooltip>
          )}
        </div>
        {/* <span className='text-xs text-gray-500'>
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </span> */}
      </div>
    </motion.div>
  );
}

interface UserFilesProps {
  refreshCount?: number;
}

export default function UserFiles({ refreshCount }: UserFilesProps) {
  const { files, loading, error, hasMore, loadMore, refresh } =
    useUserFiles(12);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      refresh();
    } catch (error) {
      console.log('Error deleting file:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (refreshCount) {
      refresh();
    }
  }, [refreshCount]);

  if (loading && files.length === 0) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 mt-5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2'>
        <span className='text-red-600'>{error}</span>
      </div>
    );
  }

  return (
    <div className='space-y-6 mt-5'>
      {files.length === 0 ? (
        <div className='text-center py-12'>
          <ImageIcon className='w-12 h-12 mx-auto text-gray-400' />
          <p className='mt-2 text-sm text-gray-500'>No files uploaded yet</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
          <AnimatePresence mode='popLayout'>
            {files.map((file) => (
              <FileCard
                refresh={refresh}
                key={file.key}
                file={file}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {hasMore && (
        <div className='flex justify-center mt-4'>
          <button
            onClick={loadMore}
            className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200'
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
