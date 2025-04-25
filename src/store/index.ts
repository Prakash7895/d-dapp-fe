'use client';
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './ChatReducer';
import messageReducer from './MessageReducer';
import { useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    message: messageReducer,
  },
});

console.log('STORE CONFIGURED');

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector = <T extends keyof RootState>(
  reducer: T
): RootState[T] =>
  useSelector((state: RootState) => state[reducer] as RootState[T]);

export const useAppDispatch = () => useDispatch<AppDispatch>();
