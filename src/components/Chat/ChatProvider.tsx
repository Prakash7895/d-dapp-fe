import React, { FC, ReactNode, useEffect } from 'react';
import { initializeSocket } from '@/socket';

const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    initializeSocket();
  }, []);
  return <>{children}</>;
};

export default ChatProvider;
