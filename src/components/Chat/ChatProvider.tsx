import React, { FC, ReactNode, useEffect } from 'react';
import { initializeSocket } from '@/socket';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';
import { markMessagesReceived } from '@/apiCalls';

export const useAppDispatch = () => useDispatch<AppDispatch>();

const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    markMessagesReceived();
  }, []);

  useEffect(() => {
    initializeSocket();
  }, []);
  return <>{children}</>;
};

export default ChatProvider;
