'use client';
import MessageList from '@/components/Chat/MessageList';
import MessageHeader from '@/components/Chat/MessageHeader';
import ChatInput from '@/components/Chat/ChatInput';
import MessageProvider from '@/components/Chat/MessageProvider';

const ChatPage = () => {
  return (
    <MessageProvider>
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
    </MessageProvider>
  );
};

export default ChatPage;
