import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store';
import InfiniteScroll from '../InfiniteScroll';
import { PAGE_SIZE } from '@/store/ChatReducer';
import Message from './Message';
import { fetchMessages } from '@/store/thunk';
import { useAppDispatch } from './ChatProvider';

const MessageList = () => {
  const { activeRoomId } = useAppSelector('chat');
  const { messages, pageNo, loading, hasMore } = useAppSelector('message');

  const dispatch = useAppDispatch();

  const handleLoadMore = () => {
    if (!loading && hasMore && activeRoomId) {
      dispatch(
        fetchMessages({ roomId: activeRoomId, pageNo, pageSize: PAGE_SIZE })
      );
    }
  };

  useEffect(() => {
    if (activeRoomId && messages.length === 0) {
      handleLoadMore();
    }
  }, [activeRoomId, loading, messages, hasMore]);

  return (
    <div className='flex-1 h-full p-4'>
      <AnimatePresence>
        <InfiniteScroll
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={loading}
          direction='bottom-to-top'
        >
          {messages.map((msg) => (
            <Message key={msg.id} {...msg} />
          ))}
        </InfiniteScroll>
      </AnimatePresence>
    </div>
  );
};

export default MessageList;
