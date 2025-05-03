import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { sendMessage, startTyping, stopTyping } from '@/socket';
import { ChatMessage } from '@/types/message';
import { useStateContext } from '../StateProvider';
import { addNewMessage, updateMessage } from '@/store/MessageReducer';
import { updateLatestMessage } from '@/store/ChatReducer';
import { useAppDispatch, useAppSelector } from '@/store';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [notified, setNotified] = useState(false);
  const dispatch = useAppDispatch();
  const { userInfo } = useStateContext();

  const { activeRoomId } = useAppSelector('chat');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    console.log('Sending message:', message);
    console.log('[handleSend] sending:', sending);
    if (!message.trim() || sending) return;
    setSending(true);
    const newMessage: ChatMessage = {
      content: message,
      createdAt: new Date().toString(),
      read: false,
      received: false,
      roomId: activeRoomId,
      senderId: userInfo!.id,
      id: new Date().getTime().toString(),
      updatedAt: new Date().toString(),
      pending: true,
    };
    dispatch(addNewMessage(newMessage));

    sendMessage(message, activeRoomId, (savedMsg) => {
      console.log('[handleSend] callback:', savedMsg);
      if (savedMsg) {
        console.log('[handleSend] savedMsg:', savedMsg.id);
        dispatch(
          updateMessage({
            data: { ...savedMsg, pending: false },
            messageId: newMessage.id,
          })
        );
        dispatch(updateLatestMessage(savedMsg));
        stopTyping(activeRoomId);
        setNotified(false);
      }
      setMessage('');
      setSending(false);
    });
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className='p-4 border-t border-gray-800'
    >
      <div className='flex items-center gap-2'>
        {/* <button className='p-2 text-gray-400 hover:text-white transition-colors'>
          <ImageIcon size={20} />
        </button> */}
        <input
          type='text'
          value={message}
          onChange={(e) => {
            if (e.target.value.length > 0 && !notified) {
              startTyping(activeRoomId);
              setNotified(true);
            }
            if (e.target.value.length === 0 && notified) {
              stopTyping(activeRoomId);
              setNotified(false);
            }
            setMessage(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          onBlur={() => {
            stopTyping(activeRoomId);
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
