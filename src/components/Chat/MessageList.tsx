import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useStateContext } from '../StateProvider';
import { Check, CheckCheck, ClockArrowUp } from 'lucide-react';
import { useAppSelector } from '@/store';

const MessageList = () => {
  const { messages } = useAppSelector('message');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  console.log('messages', messages);
  const { userInfo } = useStateContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className='flex-1 overflow-y-auto p-4 space-y-4'>
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex ${
              msg.senderId === userInfo?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.senderId === userInfo?.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <p>{msg.content}</p>
              <div className='flex items-center gap-2 mt-1'>
                <span className='text-xs opacity-70'>
                  {formatDistanceToNow(new Date(msg.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {msg.senderId === userInfo?.id && (
                  <span className='text-xs'>
                    {msg.read ? (
                      <CheckCheck className='text-primary-500' />
                    ) : msg.received ? (
                      <CheckCheck />
                    ) : msg.pending ? (
                      <ClockArrowUp />
                    ) : (
                      <Check />
                    )}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
