'use client';

import { toast } from 'react-toastify';
import {
  AddWalletAddressSchemaType,
  FILE_ACCESS,
  UpdatePasswordSchemaType,
  UserUpdateSchemaType,
} from './apiSchemas';
import { User } from './types/user';
import { S3File } from './hooks/useUserFiles';

interface ApiResponse<T = null> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export const updateWalletAddress = (
  id: number,
  data: AddWalletAddressSchemaType
) =>
  fetch(`/api/user/${id}/add-wallet-address`, {
    body: JSON.stringify(data),
    method: 'PUT',
  })
    .then((res) => res.json())
    .then((res) => res as ApiResponse<User>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return null;
    });

export const updateUserInfo = (
  data: UserUpdateSchemaType | UpdatePasswordSchemaType
) =>
  fetch(`/api/user`, { body: JSON.stringify(data), method: 'PUT' })
    .then((res) => res.json())
    .then((res) => res as ApiResponse<User>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return null;
    });

export const getUserInfo = () =>
  fetch(`/api/user`)
    .then((res) => res.json())
    .then((res) => res as ApiResponse<User>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return null;
    });

export const checkAddress = (data: AddWalletAddressSchemaType) =>
  fetch(`/api/user/check-address`, {
    body: JSON.stringify(data),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then(
      (res) =>
        res as ApiResponse<{
          isTaken: boolean;
        }>
    )
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const uploadPhoto = (formData: FormData) =>
  fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then(
      (res) =>
        res as ApiResponse<{
          id: number;
          url: string;
        }>
    )
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const getFiles = (pageNo: number, pageSize = 10) =>
  fetch(`/api/files?pageNo=${pageNo}&pageSize=${pageSize}`)
    .then((res) => res.json())
    .then((res) => res as ApiResponse<S3File[]>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const deleteFile = (fileId: number) =>
  fetch(`/api/files/${fileId}`, { method: 'DELETE' })
    .then((res) => res.json())
    .then((res) => res as ApiResponse)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const udpateFileAccess = (fileId: number, access: FILE_ACCESS) =>
  fetch(`/api/files/${fileId}`, {
    method: 'PUT',
    body: JSON.stringify({ access }),
  })
    .then((res) => res.json())
    .then((res) => res as ApiResponse)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const getUserFiles = (id: number, pageNo: number, pageSize = 10) =>
  fetch(`/api/user/${id}/files?pageNo=${pageNo}&pageSize=${pageSize}`)
    .then((res) => res.json())
    .then((res) => res as ApiResponse<S3File[]>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const uploadProfilePicture = (formData: FormData) =>
  fetch('/api/user/upload-profile-picture', {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => res as ApiResponse<User>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });
