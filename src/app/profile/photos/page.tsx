'use client';
import PhotoUploader from '@/components/PhotoUploader';
import UserFiles from '@/components/UserFiles';
import React, { useState } from 'react';

const ProfilePhotos = () => {
  const [refreshCount, setRefreshCount] = useState(0);

  return (
    <div>
      <PhotoUploader
        onSuccess={() => {
          setRefreshCount((p) => p + 1);
        }}
      />
      <UserFiles refreshCount={refreshCount} />
    </div>
  );
};

export default ProfilePhotos;
