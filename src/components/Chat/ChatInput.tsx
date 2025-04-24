import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Send } from 'lucide-react';
import { useMessages } from './MessageProvider';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [notified, setNotified] = useState(false);

  const { sendMessage, startTyping, stopTyping } = useMessages();

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message);
    setMessage('');
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className='p-4 border-t border-gray-800'
    >
      <div className='flex items-center gap-2'>
        <button className='p-2 text-gray-400 hover:text-white transition-colors'>
          <ImageIcon size={20} />
        </button>
        <input
          type='text'
          value={message}
          onChange={(e) => {
            if (e.target.value.length > 0 && !notified) {
              startTyping();
              setNotified(true);
            } else {
              if (notified) {
                stopTyping();
              }
              setNotified(false);
            }
            setMessage(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          onBlur={() => {
            stopTyping();
            setNotified(false);
          }}
          placeholder='Type a message...'
          className='flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500'
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          className='p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors'
        >
          <Send size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ChatInput;
