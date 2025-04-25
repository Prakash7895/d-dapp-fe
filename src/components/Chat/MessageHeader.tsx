import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

import { useAppSelector } from '@/store';

const MessageHeader = () => {
  const { chats, activeRoomId } = useAppSelector('chat');

  const activeChat = chats.find((el) => el.roomId === activeRoomId);
  const isTyping = false;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className='p-4 border-b border-gray-800 flex items-center gap-4'
    >
      <div className='relative'>
        {activeChat?.profilePicture ? (
          <img
            src={activeChat?.profilePicture}
            alt=''
            className='w-10 h-10 rounded-full'
          />
        ) : (
          <User className='w-10 h-10 rounded-full' />
        )}
        {/* {currentRoom?.otherUser?.isOnline && (
          <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900' />
        )} */}
      </div>
      <div>
        <h2 className='text-white font-medium'>
          {activeChat?.firstName} {activeChat?.lastName}
        </h2>
        {isTyping && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-sm text-gray-400'
          >
            typing...
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default MessageHeader;
