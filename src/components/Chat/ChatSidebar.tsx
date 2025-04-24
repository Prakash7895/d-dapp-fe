'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';
import { useChatListContext } from './ChatListProvider';
import { BeatLoader } from 'react-spinners';

const ChatSidebar = () => {
  const { chats, setActiveRoomId, loading, onLineUser, isTyping } =
    useChatListContext();

  return (
    <div className='h-full flex flex-col'>
      <div className='p-4 border-b border-gray-800'>
        <h2 className='text-xl font-bold text-white'>Messages</h2>
      </div>
      <div className='flex-1 overflow-y-auto h-full'>
        {chats.map((match) => {
          const isTypingUser = isTyping.find(
            (user) => user.roomId === match.roomId
          );
          return (
            <Link
              key={match.roomId}
              href={`/chat/${match.roomId}`}
              className='block'
              onClick={() => {
                setActiveRoomId(match.roomId);
              }}
            >
              <motion.div
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                className='p-4 border-b border-gray-800 cursor-pointer'
              >
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    {match.profilePicture ? (
                      <img
                        src={match.profilePicture}
                        alt={match.firstName!}
                        className='w-12 h-12 rounded-full object-cover'
                      />
                    ) : (
                      <User className='w-12 h-12 rounded-full' />
                    )}
                    {onLineUser.includes(match.userId) && (
                      <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900' />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-white font-medium truncate'>
                      {`${match.firstName} ${match.lastName}`}
                    </h3>
                    {isTypingUser ? (
                      <BeatLoader color='#cf29de' size={8} />
                    ) : (
                      match?.lastMessage && (
                        <p className='text-sm h-6 text-gray-400 truncate'>
                          {match?.lastMessage?.content}
                        </p>
                      )
                    )}
                  </div>
                  {match?.lastMessage && (
                    <span className='text-xs text-gray-500 whitespace-nowrap'>
                      {formatDistanceToNow(
                        new Date(match?.lastMessage?.createdAt || Date.now()),
                        { addSuffix: true }
                      )}
                    </span>
                  )}
                </div>
              </motion.div>
            </Link>
          );
        })}
        {loading && (
          <div className='h-full flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500'></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
