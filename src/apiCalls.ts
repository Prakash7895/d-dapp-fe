'use client';

import { toast } from 'react-toastify';
// import {
//   AddWalletAddressSchemaType,
//   FILE_ACCESS,
//   UpdatePasswordSchemaType,
//   UserUpdateSchemaType,
// } from './apiSchemas';
import { ProfileCard, User } from './types/user';
import { S3File } from './hooks/useUserFiles';
import axios from 'axios';

interface ApiResponse<T = null> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_END_POINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject({ message });
  }
);

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default axiosInstance;

export const updateWalletAddress = (id: number, data: any) =>
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

export const updateUserInfo = (data: any) =>
  fetch(`/api/user`, { body: JSON.stringify(data), method: 'PUT' })
    .then((res) => res.json())
    .then((res) => res as ApiResponse<User>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return null;
    });

export const getUserInfo = () => Promise<{}>;
// fetch(`/api/user`)
//   .then((res) => res.json())
//   .then((res) => res as ApiResponse<User>)
//   .catch((err) => {
//     toast.error(err?.message || 'Failed to update user info');
//     return null;
//   });

export const checkAddress = (data: any) =>
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

export const udpateFileAccess = (fileId: number, access: any) =>
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
    method: 'PUT',
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => res as ApiResponse<User>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const getSignedUrl = (key: string) =>
  fetch(`/api/files/signed-url/${key}`)
    .then((res) => res.json())
    .then((res) => res as ApiResponse<string>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const getUsers = (pageNo: number, pageSize = 10) =>
  fetch(`/api/users?pageNo=${pageNo}&pageSize=${pageSize}`)
    .then((res) => res.json())
    .then((res) => res as ApiResponse<{ users: ProfileCard[]; total: number }>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const login = ({
  type,
  email,
  password,
  walletAddress,
  signedMessage,
}: {
  type: 'email' | 'wallet';
  email?: string;
  password?: string;
  walletAddress?: string;
  signedMessage?: string;
}) =>
  axiosInstance
    .post(
      '/auth/login',
      type === 'email' ? { email, password } : { walletAddress, signedMessage }
    )
    .then(
      (res) =>
        res.data as ApiResponse<{
          access_token: string;
          refresh_token: string;
        }>
    )
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error', message: err?.message } as ApiResponse;
    });

export const logout = () =>
  axiosInstance
    .post('/auth/logout')
    .then((res) => res.data as ApiResponse)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });
