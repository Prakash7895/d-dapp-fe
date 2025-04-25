import React, { useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import InfiniteScroll from '../InfiniteScroll';
import { getMessages } from '@/apiCalls';
import { PAGE_SIZE } from '@/store/ChatReducer';
import { setLoading, setMessages } from '@/store/MessageReducer';
import Message from './Message';

const MessageList = () => {
  const { activeRoomId } = useAppSelector('chat');
  const { messages, pageNo, loading, hasMore } = useAppSelector('message');

  console.log('messages', messages);

  const dispatch = useAppDispatch();

  const fetchMessages = useCallback(async () => {
    if (loading) return;

    if (activeRoomId) {
      try {
        dispatch(setLoading(true));
        const response = await getMessages(activeRoomId, pageNo, PAGE_SIZE);
        if (response.status === 'success' && response.data) {
          dispatch(setMessages({ data: response.data, page: pageNo + 1 }));
        }
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      }
    }
  }, [activeRoomId, pageNo, loading]);

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className='flex-1 h-full p-4'>
      <AnimatePresence>
        <InfiniteScroll
          onLoadMore={fetchMessages}
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
