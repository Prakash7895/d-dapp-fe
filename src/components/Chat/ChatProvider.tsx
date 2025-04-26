import React, { FC, ReactNode, useEffect } from 'react';
import { initializeSocket } from '@/socket';
import { markMessagesReceived } from '@/apiCalls';

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
