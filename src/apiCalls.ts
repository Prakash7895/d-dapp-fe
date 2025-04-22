'use client';

import { toast } from 'react-toastify';
// import {
//   AddWalletAddressSchemaType,
//   FILE_ACCESS,
//   UpdatePasswordSchemaType,
//   UserUpdateSchemaType,
// } from './apiSchemas';
import {
  AllUsers,
  LikdedUser,
  MatchedUser,
  UserByAddress,
  UserResponse,
} from './types/user';
import { S3File } from './hooks/useUserFiles';
import axios from 'axios';
import { MultiSigWallet } from './types/wallet';

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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.data?.message?.includes('Unauthorized') &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BE_END_POINT}/auth/refresh`,
          { refreshToken }
        );

        const { access_token } = response.data.data;
        sessionStorage.setItem('accessToken', access_token);

        axiosInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        window.location.href = '/auth/signin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject({ message });
  }
);

axiosInstance.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default axiosInstance;

export const updateUserInfo = (data: any) =>
  axiosInstance
    .put('/profile', data)
    .then((res) => res.data as ApiResponse<UserResponse>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return null;
    });

export const updateUserPassword = (data: any) =>
  axiosInstance
    .put('/profile/password', data)
    .then((res) => res.data as ApiResponse<UserResponse>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return null;
    });

export const getUserInfo = () =>
  axiosInstance
    .get('/profile')
    .then((res) => res.data as ApiResponse<UserResponse>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to get user info');
      return null;
    });

export const uploadPhoto = (formData: FormData) =>
  axiosInstance
    .put('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data as ApiResponse)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const getFiles = (pageNo: number, pageSize = 10) =>
  axiosInstance
    .get(`/profile/photos?pageNo=${pageNo}&pageSize=${pageSize}`)
    .then(
      (res) =>
        res.data as ApiResponse<{
          data: S3File[];
          total: number;
        }>
    )
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const deleteFile = (fileId: number) =>
  axiosInstance
    .delete(`/profile/photo/${fileId}`)
    .then((res) => res.data as ApiResponse)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const udpateFileAccess = (fileId: number, access: any) =>
  axiosInstance
    .put(`/profile/photo/${fileId}`, { access })
    .then((res) => res.data as ApiResponse)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const uploadProfilePicture = (formData: FormData) =>
  axiosInstance
    .put('/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data as ApiResponse<UserResponse>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const getSignedUrl = (key: string) =>
  axiosInstance
    .get(`/docs/${key}`)
    .then((res) => res.data as ApiResponse<string>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const getUsers = (pageNo: number, pageSize = 10) =>
  axiosInstance
    .get(`/users?pageNo=${pageNo}&pageSize=${pageSize}`)
    .then(
      (res) => res.data as ApiResponse<{ users: AllUsers[]; total: number }>
    )
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

export const getLikedUsers = (pageNo: number, pageSize = 10) =>
  axiosInstance
    .get(`/users/liked?pageNo=${pageNo}&pageSize=${pageSize}`)
    .then(
      (res) => res.data as ApiResponse<{ users: LikdedUser[]; total: number }>
    )
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const mintNFT = (formData: FormData) =>
  axiosInstance
    .post('/nft/mint', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(
      (res) =>
        res.data as ApiResponse<{
          imageUrl: string;
          metadataUrl: string;
          imageCID: string;
          metadataCID: string;
        }>
    )
    .catch((err) => {
      toast.error(err?.message || 'Failed to mint NFT');
      return { status: 'error' } as ApiResponse;
    });

export const checkConnectedWalletAddress = (walletAddress: string) =>
  axiosInstance
    .put('/profile/check-wallet-address', { walletAddress })
    .then((res) => res.data as ApiResponse)
    .catch((err) => {
      toast.error(err?.message || 'Failed to cehck wallet address');
      return { status: 'error' } as ApiResponse;
    });

export const saveConnectedWalletAddress = (walletAddress: string) =>
  axiosInstance
    .put('/profile/wallet-address', { walletAddress })
    .then((res) => res.data as ApiResponse)
    .catch((err) => {
      toast.error(err?.message || 'Failed to save wallet address');
      return { status: 'error' } as ApiResponse;
    });

export const addEmail = (data: {
  email: string;
  password: string;
  confirmPassword: string;
}) =>
  axiosInstance
    .put('/profile/email', data)
    .then((res) => res.data as ApiResponse)
    .catch((err) => {
      toast.error(err?.message || 'Failed to save wallet address');
      return { status: 'error' } as ApiResponse;
    });

export const getMatchedUsers = (pageNo: number, pageSize = 10) =>
  axiosInstance
    .get(`/users/matched?pageNo=${pageNo}&pageSize=${pageSize}`)
    .then(
      (res) => res.data as ApiResponse<{ users: MatchedUser[]; total: number }>
    )
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return { status: 'error' } as ApiResponse;
    });

export const getMultiSigWalletAddress = (addressA: string, addressB: string) =>
  axiosInstance
    .get(`/users/multi-sig-wallet/${addressA}/${addressB}`)
    .then((res) => res.data as ApiResponse<MultiSigWallet>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to get multi sig wallet');
      return { status: 'error' } as ApiResponse;
    });

export const getUserByAddress = (address: string) =>
  axiosInstance
    .get(`/users/by-address/${address}`)
    .then((res) => res.data as ApiResponse<UserByAddress>)
    .catch((err) => {
      toast.error(err?.message || 'Failed to get user by address');
      return { status: 'error' } as ApiResponse;
    });
