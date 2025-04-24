import { getMessages } from '@/apiCalls';
import { ChatMessage } from '@/types/message';
import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CHAT_EVENTS, EMIT_EVENTS, getSocket } from './ChatProvider';
import { useStateContext } from '../StateProvider';
import { useChatListContext } from './ChatListProvider';

interface ContextState {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  fetchMessages: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;

  sendMessage: (content: string) => Promise<boolean>;
  startTyping: () => void;
  stopTyping: () => void;
}

const Context = createContext<ContextState>({} as ContextState);

const MessageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useStateContext();

  const { activeRoomId } = useChatListContext();

  const fetchMessages = useCallback(async () => {
    if (activeRoomId) {
      try {
        const response = await getMessages(activeRoomId, pageNo, 20);
        if (response.status === 'success' && response.data) {
          if (response.data.length < 20) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
          setPageNo((p) => p + 1);
          setMessages((p) =>
            pageNo === 1 ? response.data! : [...p, ...response.data!]
          );
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
        setLoading(false);
      }
    }
  }, [activeRoomId, pageNo]);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    socket.removeListener(CHAT_EVENTS.MESSAGE_STATUS);
    socket.removeListener(CHAT_EVENTS.NEW_MESSAGE);

    socket.on(
      CHAT_EVENTS.MESSAGE_STATUS,
      (message: { messageId: string; status: 'received' | 'read' }) => {
        console.log('MESSAGE_STATUS:', message);
        setMessages((prev) => {
          const idx = prev.findIndex((msg) => msg.id === message.messageId);
          if (idx >= 0) {
            return prev.map((msg) => {
              if (msg.id === message.messageId) {
                return {
                  ...msg,
                  [message.status]: true,
                  pending: false,
                };
              }
              return msg;
            });
          }
          return prev;
        });
      }
    );

    socket.on(CHAT_EVENTS.NEW_MESSAGE, (message) => {
      console.log('NEW_MESSAGE:', message);
      if (message.roomId === activeRoomId) {
        setMessages((prev) => {
          const idx = prev.findIndex((msg) => msg.id === message.messageId);
          if (idx < 0) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    return () => {
      socket?.off(CHAT_EVENTS.MESSAGE_STATUS);
      socket?.off(CHAT_EVENTS.NEW_MESSAGE);
    };
  }, [activeRoomId]);

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      const socket = getSocket();
      if (!socket || !activeRoomId) return false;

      try {
        const newMessage: ChatMessage = {
          content,
          createdAt: new Date(),
          read: false,
          received: false,
          roomId: activeRoomId,
          senderId: userInfo?.id!, // Replace with actual user ID
          id: new Date().getTime().toString(),
          updatedAt: new Date(),
          pending: true,
        };

        setMessages((prev) => [...prev, newMessage]);

        socket.emit(
          EMIT_EVENTS.SEND_MESSAGE,
          { roomId: activeRoomId, content },
          (message: ChatMessage) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === newMessage.id
                  ? { ...msg, id: message.id, pending: false }
                  : msg
              )
            );
          }
        );

        return true;
      } catch (err) {
        console.error('Failed to send message:', err);
        return false;
      }
    },
    [activeRoomId]
  );

  const startTyping = useCallback(() => {
    const socket = getSocket();
    if (socket && activeRoomId) {
      socket.emit(EMIT_EVENTS.START_TYPING, { roomId: activeRoomId });
    }
  }, [activeRoomId]);

  const stopTyping = useCallback(() => {
    const socket = getSocket();
    if (socket && activeRoomId) {
      socket.emit(EMIT_EVENTS.STOP_TYPING, { roomId: activeRoomId });
    }
  }, [activeRoomId]);

  const value = useMemo(
    () => ({
      messages,
      setMessages,
      hasMore,
      fetchMessages,
      loading,
      sendMessage,
      startTyping,
      stopTyping,
    }),
    [
      messages,
      setMessages,
      hasMore,
      fetchMessages,
      loading,
      sendMessage,
      startTyping,
      stopTyping,
    ]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default MessageProvider;

export const useMessages = () => useContext(Context);
