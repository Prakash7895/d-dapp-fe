'use client';
import PhotoUploader from '@/components/PhotoUploader';
import UserFiles from '@/components/UserFiles';
import React from 'react';

const ProfilePhotos = () => {
  return (
    <div>
      <PhotoUploader />
      <UserFiles />
    </div>
  );
};

export default ProfilePhotos;
