'use client';

import { toast } from 'react-toastify';
import { AddWalletAddressSchemaType, UserUpdateSchemaType } from './apiSchemas';
import { User } from './types/user';

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
    .then((res) => res as User)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return null;
    });

export const updateUserInfo = (id: number, data: UserUpdateSchemaType) =>
  fetch(`/api/user/${id}`, { body: JSON.stringify(data), method: 'PUT' })
    .then((res) => res.json())
    .then((res) => res as User)
    .catch((err) => {
      toast.error(err?.message || 'Failed to update user info');
      return null;
    });

export const getUserInfo = () =>
  fetch(`/api/user`)
    .then((res) => res.json())
    .then((res) => res?.data as User)
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
