'use client';
import MessageList from '@/components/Chat/MessageList';
import MessageHeader from '@/components/Chat/MessageHeader';
import ChatInput from '@/components/Chat/ChatInput';

const ChatPage = () => {
  return (
    <div className='h-full flex flex-col'>
      <div className='h-20'>
        <MessageHeader />
      </div>
      <div className='flex-1 overflow-auto'>
        <MessageList />
      </div>

      <div className='h-20'>
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatPage;
