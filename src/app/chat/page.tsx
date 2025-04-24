'use client';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import React from 'react';

const ChatsPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='h-full flex flex-col items-center justify-center text-gray-400'
    >
      <MessageSquare size={48} className='mb-4 text-gray-600' />
      <h2 className='text-xl font-medium mb-2'>No Chat Selected</h2>
      <p className='text-sm text-gray-500'>
        Select a conversation from the sidebar to start chatting
      </p>
    </motion.div>
  );
};

export default ChatsPage;
