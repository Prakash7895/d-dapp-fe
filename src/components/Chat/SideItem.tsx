import { ChatUser } from '@/types/user';
import React, { FC } from 'react';
import { BeatLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store';
import { useStateContext } from '../StateProvider';
import Link from 'next/link';
import { PAGE_SIZE, setActiveRoomId } from '@/store/ChatReducer';
import { User } from 'lucide-react';
import { resetMessages } from '@/store/MessageReducer';
import { fetchMessages } from '@/store/thunk';
import { useAppDispatch } from './ChatProvider';

const SideItem: FC<ChatUser> = (chat) => {
  const { typingUsers, onlineUsers } = useAppSelector('chat');
  const { userInfo } = useStateContext();
  const dispatch = useAppDispatch();

  const isTypingUser = typingUsers.find(
    (user) => user.roomId === chat.roomId && user.userId !== userInfo?.id
  );

  return (
    <Link
      key={chat.roomId}
      href={`/chat/${chat.roomId}`}
      className='block'
      onClick={() => {
        dispatch(resetMessages());
        dispatch(
          fetchMessages({
            roomId: chat.roomId,
            pageNo: 1,
            pageSize: PAGE_SIZE,
          })
        );
        dispatch(setActiveRoomId(chat.roomId));
      }}
    >
      <motion.div
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        className='p-4 border-b border-gray-800 cursor-pointer'
      >
        <div className='flex items-center gap-3'>
          <div className='relative'>
            {chat.profilePicture ? (
              <img
                src={chat.profilePicture}
                alt={chat.firstName!}
                className='w-12 h-12 rounded-full object-cover'
              />
            ) : (
              <User className='w-12 h-12 rounded-full' />
            )}
            {onlineUsers.includes(chat.userId) && (
              <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900' />
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='text-white font-medium truncate'>
              {`${chat.firstName} ${chat.lastName}`}
            </h3>
            {isTypingUser ? (
              <BeatLoader color='#cf29de' size={8} />
            ) : (
              chat?.lastMessage && (
                <p
                  className={`text-sm h-6 text-gray-400 truncate ${
                    chat.unreadCount > 0
                      ? 'font-semibold !text-primary-400'
                      : ''
                  }`}
                >
                  {chat?.lastMessage?.content}
                </p>
              )
            )}
          </div>
          <div className='flex flex-col items-end'>
            {/* {chat?.lastMessage && (
              <span className='text-xs text-gray-500 whitespace-nowrap'>
                {formatDistanceToNow(
                  new Date(chat?.lastMessage?.createdAt || Date.now()),
                  { addSuffix: true }
                )}
              </span>
            )} */}
            {chat?.unreadCount > 0 && (
              <span className='bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-1'>
                {chat?.unreadCount}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default SideItem;
