'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';
import { BeatLoader } from 'react-spinners';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  PAGE_SIZE,
  setActiveRoomId,
  setChats,
  setLoading,
} from '@/store/ChatReducer';
import { useCallback, useEffect } from 'react';
import { getChats } from '@/apiCalls';
import InfiniteScroll from '../InfiniteScroll';
import { useStateContext } from '../StateProvider';

const ChatSidebar = () => {
  const { chats, loading, hasMore, onlineUsers, typingUsers } =
    useAppSelector('chat');
  const dispatch = useAppDispatch();
  const { userInfo } = useStateContext();

  const { pageNo } = useAppSelector('chat');

  const fetchChats = useCallback(async () => {
    if (loading) return;
    try {
      dispatch(setLoading(true));
      const response = await getChats(pageNo, PAGE_SIZE);
      if (response.status === 'success' && response.data) {
        dispatch(setChats({ data: response.data, page: pageNo + 1 }));
      }
    } catch (err) {
      console.log('Failed to fetch matches:', err);
    }
  }, [pageNo, loading]);

  useEffect(() => {
    fetchChats();
  }, []);

  console.log('Chats', chats);

  return (
    <div className='h-full flex flex-col'>
      <div className='p-4 border-b border-gray-800'>
        <h2 className='text-xl font-bold text-white'>Messages</h2>
      </div>
      <InfiniteScroll
        onLoadMore={fetchChats}
        hasMore={hasMore}
        isLoading={loading}
        direction='top-to-bottom'
      >
        {chats.map((match) => {
          const isTypingUser = typingUsers.find(
            (user) =>
              user.roomId === match.roomId && user.userId !== userInfo?.id
          );
          return (
            <Link
              key={match.roomId}
              href={`/chat/${match.roomId}`}
              className='block'
              onClick={() => {
                dispatch(setActiveRoomId(match.roomId));
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
                    {onlineUsers.includes(match.userId) && (
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
                        <p className={'text-sm h-6 text-gray-400 truncate'}>
                          {match?.lastMessage?.content}
                        </p>
                      )
                    )}
                  </div>
                  <div className='flex flex-col items-end'>
                    {match?.lastMessage && (
                      <span className='text-xs text-gray-500 whitespace-nowrap'>
                        {formatDistanceToNow(
                          new Date(match?.lastMessage?.createdAt || Date.now()),
                          { addSuffix: true }
                        )}
                      </span>
                    )}
                    {match?.unreadCount > 0 && (
                      <span className='bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-1'>
                        {match?.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </InfiniteScroll>
    </div>
  );
};

export default ChatSidebar;
