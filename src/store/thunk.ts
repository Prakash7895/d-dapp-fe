import { getChats, getMessages } from '@/apiCalls';
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
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
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
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
