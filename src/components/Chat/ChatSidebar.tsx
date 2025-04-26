'use client';
import { useAppSelector } from '@/store';
import { PAGE_SIZE } from '@/store/ChatReducer';
import InfiniteScroll from '../InfiniteScroll';
import SideItem from './SideItem';
import { fetchChats } from '@/store/thunk';
import { useAppDispatch } from './ChatProvider';

const ChatSidebar = () => {
  const { chats, loading, hasMore, pageNo } = useAppSelector('chat');
  const dispatch = useAppDispatch();

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchChats({ pageNo, pageSize: PAGE_SIZE }));
    }
  };

  return (
    <div className='h-full flex flex-col'>
      <div className='p-4 border-b border-gray-800'>
        <h2 className='text-xl font-bold text-white'>Messages</h2>
      </div>
      <InfiniteScroll
        onLoadMore={handleLoadMore}
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
