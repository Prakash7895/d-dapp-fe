'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ChatSidebar from '@/components/Chat/ChatSidebar';
import { useWalletContext } from '@/components/WalletHandler';
import { useParams } from 'next/navigation';
import ChatListProvider from '@/components/Chat/ChatListProvider';

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const { connectedToValidAddress } = useWalletContext();

  const params = useParams();

  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const rect = divRef.current?.getBoundingClientRect();
    const body = document.getElementsByTagName('body')?.[0];
    if (rect) {
      setHeight(body.offsetHeight - rect.top - 5);
    }
  }, [divRef.current, connectedToValidAddress]);

  return (
    <div
      ref={divRef}
      style={height ? { height: `${height}px` } : {}}
      className='flex h-full bg-gray-900'
    >
      {height ? (
        <ChatListProvider roomId={roomId}>
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className='w-80 border-r border-gray-800 h-full'
          >
            <ChatSidebar />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex-1 h-full'
          >
            {children}
          </motion.div>
        </ChatListProvider>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ChatLayout;
