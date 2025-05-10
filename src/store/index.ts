'use client';
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './ChatReducer';
import messageReducer from './MessageReducer';
import matchReducer from './MatchReducer';
import usersReducer from './UsersReducer';
import userReducer from './UserReducer';
import notificationReducer from './NotificationReducer';
import likedReducer from './LikedReducer';
import matchesReducer from './MatchesReducer';
import { useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    message: messageReducer,
    match: matchReducer,
    notification: notificationReducer,
    users: usersReducer,
    user: userReducer,
    liked: likedReducer,
    matches: matchesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector = <T extends keyof RootState>(
  reducer: T
): RootState[T] =>
  useSelector((state: RootState) => state[reducer] as RootState[T]);
