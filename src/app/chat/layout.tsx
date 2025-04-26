'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ChatSidebar from '@/components/Chat/ChatSidebar';
import { useWalletContext } from '@/components/WalletHandler';
import { useParams } from 'next/navigation';
import { PAGE_SIZE, resetChats, setActiveRoomId } from '@/store/ChatReducer';
import { fetchChats } from '@/store/thunk';
import { useAppDispatch, useAppSelector } from '@/store';

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const { connectedToValidAddress } = useWalletContext();

  const params = useParams();
  const dispatch = useAppDispatch();
  const { activeRoomId } = useAppSelector('chat');

  useEffect(() => {
    dispatch(resetChats());
    dispatch(fetchChats({ pageNo: 1, pageSize: PAGE_SIZE }));
  }, []);

  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;
  useEffect(() => {
    if (roomId && roomId !== activeRoomId) {
      dispatch(setActiveRoomId(roomId));
    }
  }, [roomId, activeRoomId]);

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
      className='flex h-full bg-gray-900 w-full'
    >
      {height ? (
        <>
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className='max-w-80 border-r border-gray-800 h-full w-1/3'
          >
            <ChatSidebar />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex-1 h-full w-2/3'
          >
            {children}
          </motion.div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ChatLayout;
