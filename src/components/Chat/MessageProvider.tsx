import { getMessages } from '@/apiCalls';
import React, { FC, ReactNode, useCallback, useEffect } from 'react';
import { resetMessages, setMessages } from '@/store/MessageReducer';
import { useAppDispatch, useAppSelector } from '@/store';
import { PAGE_SIZE } from '@/store/ChatReducer';

const MessageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  const { activeRoomId } = useAppSelector('chat');
  const { pageNo } = useAppSelector('message');

  const fetchMessages = useCallback(async () => {
    if (activeRoomId) {
      try {
        const response = await getMessages(activeRoomId, pageNo, PAGE_SIZE);
        if (response.status === 'success' && response.data) {
          dispatch(setMessages(response.data));
        }
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      }
    }
  }, [activeRoomId]);

  useEffect(() => {
    if (activeRoomId) {
      dispatch(resetMessages());
      fetchMessages();
    }
  }, [activeRoomId]);

  return <>{children}</>;
};

export default MessageProvider;
