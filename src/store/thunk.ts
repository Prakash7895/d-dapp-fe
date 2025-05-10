import {
  getChats,
  getLikedUsers,
  getMatchedUsers,
  getMessages,
  getNotifications,
  getUserFiles,
  getUserNfts,
  getUsers,
} from '@/apiCalls';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchMessages = createAsyncThunk(
  'message/fetchMessages',
  async (
    {
      roomId,
      pageNo,
      pageSize,
    }: { roomId: string; pageNo: number; pageSize: number },
    thunkAPI
  ) => {
    try {
      const response = await getMessages(roomId, pageNo, pageSize);
      if (response.status === 'success') {
        return { data: response.data, page: pageNo + 1 };
      } else {
        return thunkAPI.rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (
    { pageNo, pageSize }: { pageNo: number; pageSize: number },
    thunkAPI
  ) => {
    try {
      const response = await getChats(pageNo, pageSize);
      if (response.status === 'success') {
        return { data: response.data, page: pageNo + 1 };
      } else {
        return thunkAPI.rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (
    { pageNo, pageSize }: { pageNo: number; pageSize: number },
    thunkAPI
  ) => {
    try {
      const response = await getNotifications(pageNo, pageSize);
      if (response.status === 'success') {
        return { data: response.data, page: pageNo + 1 };
      } else {
        return thunkAPI.rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (
    { pageNo, pageSize }: { pageNo: number; pageSize: number },
    thunkAPI
  ) => {
    try {
      const response = await getUsers(pageNo, pageSize);
      if (response.status === 'success') {
        return { data: response.data, page: pageNo + 1, pageSize };
      } else {
        return thunkAPI.rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUserFiles = createAsyncThunk(
  'user/fetchUserFiles',
  async (
    { id, pageNo, pageSize }: { id: string; pageNo: number; pageSize: number },
    thunkAPI
  ) => {
    try {
      const response = await getUserFiles(id, pageNo, pageSize);
      if (response.status === 'success') {
        return { data: response.data, page: pageNo + 1, pageSize };
      } else {
        return thunkAPI.rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUserNfts = createAsyncThunk(
  'user/fetchUserNfts',
  async (
    { id, pageNo, pageSize }: { id: string; pageNo: number; pageSize: number },
    thunkAPI
  ) => {
    try {
      const response = await getUserNfts(id, pageNo, pageSize);
      if (response.status === 'success') {
        return { data: response.data, page: pageNo + 1, pageSize };
      } else {
        return thunkAPI.rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const fetchLikedUsers = createAsyncThunk(
  'liked/fetchUsers',
  async (
    { pageNo, pageSize }: { pageNo: number; pageSize: number },
    thunkAPI
  ) => {
    try {
      const response = await getLikedUsers(pageNo, pageSize);
      if (response.status === 'success') {
        return { data: response.data, page: pageNo + 1, pageSize };
      } else {
        return thunkAPI.rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const fetchMatchedUsers = createAsyncThunk(
  'matched/fetchUsers',
  async (
    { pageNo, pageSize }: { pageNo: number; pageSize: number },
    thunkAPI
  ) => {
    try {
      const response = await getMatchedUsers(pageNo, pageSize);
      if (response.status === 'success') {
        return { data: response.data, page: pageNo + 1, pageSize };
      } else {
        return thunkAPI.rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);
