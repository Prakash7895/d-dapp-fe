'use client';
import { useAppDispatch, useAppSelector } from '@/store';
import { PAGE_SIZE, setChats, setLoading } from '@/store/ChatReducer';
import { useEffect } from 'react';
import { getChats } from '@/apiCalls';
import InfiniteScroll from '../InfiniteScroll';
import SideItem from './SideItem';

const ChatSidebar = () => {
  const { chats, loading, hasMore, pageNo } = useAppSelector('chat');
  const dispatch = useAppDispatch();

  console.log('pageNo', pageNo);

  const fetchChats = async () => {
    if (loading) return;
    try {
      dispatch(setLoading(true));
      const response = await getChats(pageNo, PAGE_SIZE);
      if (response.status === 'success' && response.data) {
        const newPageNo = pageNo + 1;
        dispatch(setChats({ data: response.data, page: newPageNo }));
      }
    } catch (err) {
      console.log('Failed to fetch matches:', err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

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
        {chats.map((match) => (
          <SideItem key={match.id} {...match} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ChatSidebar;
