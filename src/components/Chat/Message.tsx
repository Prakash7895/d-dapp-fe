import React, { FC, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from '@/types/message';
import { useStateContext } from '../StateProvider';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, ClockArrowUp } from 'lucide-react';
import { markReadMessage } from '@/socket';
import { updateMessageStatus } from '@/store/MessageReducer';
import { decrementUnreadCount } from '@/store/ChatReducer';
import { useAppDispatch, useAppSelector } from '@/store';

const Message: FC<ChatMessage> = (msg) => {
  const { userInfo } = useStateContext();
  const dispatch = useAppDispatch();

  const { activeRoomId } = useAppSelector('chat');
  const marking = useRef(false);

  useEffect(() => {
    if (
      msg.roomId === activeRoomId &&
      !msg.read &&
      msg.senderId !== userInfo?.id
    ) {
      if (marking.current) return;
      marking.current = true;
      markReadMessage(msg.id, (response) => {
        if (response?.status === 'success') {
          dispatch(updateMessageStatus({ messageId: msg.id, status: 'read' }));
          dispatch(decrementUnreadCount({ roomId: msg.roomId }));
        }
        marking.current = false;
      });
    }
  }, [activeRoomId, msg]);

  return (
    <motion.div
      key={msg.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${
        msg.senderId === userInfo?.id ? 'justify-end' : 'justify-start'
      } mt-4`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          msg.senderId === userInfo?.id
            ? 'bg-primary-950 text-white'
            : 'bg-gray-800 text-gray-100'
        }`}
      >
        <p className='break-words'>{msg.content}</p>
        <div className='flex items-center gap-2 mt-1'>
          <span className='text-xs opacity-70'>
            {formatDistanceToNow(new Date(msg.createdAt), {
              addSuffix: true,
            })}
          </span>
          {msg.senderId === userInfo?.id && (
            <span className='text-xs'>
              {msg.read ? (
                <CheckCheck size={16} className='text-orange-500' />
              ) : msg.received ? (
                <CheckCheck size={16} />
              ) : msg.pending ? (
                <ClockArrowUp size={16} />
              ) : (
                <Check size={16} />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
