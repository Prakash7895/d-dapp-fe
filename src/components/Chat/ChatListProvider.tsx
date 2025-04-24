import { getChats } from '@/apiCalls';
import { ChatUser } from '@/types/user';
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
import { CHAT_EVENTS, getSocket } from './ChatProvider';

interface ContextState {
  chats: ChatUser[];
  hasMore: boolean;
  setActiveRoomId: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  activeRoomId: string;
  fetchChats: () => Promise<void>;
  onLineUser: string[];
  isTyping: {
    roomId: string;
    userId: string;
  }[];
}

const Context = createContext<ContextState>({} as ContextState);

const ChatListProvider: FC<{ children: ReactNode; roomId?: string }> = ({
  children,
  roomId,
}) => {
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState(roomId || '');
  const [onLineUser, setOnLineUser] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<
    { roomId: string; userId: string }[]
  >([]);

  const fetchChats = useCallback(async () => {
    try {
      const response = await getChats(pageNo, 20);
      if (response.status === 'success' && response.data) {
        if (response.data.length < 20) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setPageNo((p) => p + 1);
        setChats((p) =>
          pageNo === 1 ? response.data! : [...p, ...response.data!]
        );
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      setLoading(false);
    }
  }, [pageNo]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    socket.removeListener(CHAT_EVENTS.INITIAL_ONLINE_STATUSES);

    socket.on(
      CHAT_EVENTS.INITIAL_ONLINE_STATUSES,
      (message: { userId: string; online: boolean }[]) => {
        console.log('INITIAL_ONLINE_STATUSES:', message);
        setOnLineUser(message.filter((el) => el.online).map((m) => m.userId));
      }
    );

    socket.on(
      CHAT_EVENTS.USER_TYPING,
      (message: { roomId: string; userId: string; typing: boolean }) => {
        console.log('USER_TYPING:', message);

        setIsTyping((p) => {
          const idx = p.findIndex(
            (e) => e.roomId === message.roomId && e.userId === message.userId
          );
          if (message.typing) {
            if (idx < 0) {
              return [...p, { roomId: message.roomId, userId: message.userId }];
            }
          }
          if (!message.typing) {
            if (idx >= 0) {
              return p.filter((_, i) => i !== idx);
            }
          }
          return p;
        });
      }
    );

    return () => {
      socket?.off(CHAT_EVENTS.INITIAL_ONLINE_STATUSES);
    };
  }, []);

  const value = useMemo(
    () => ({
      chats,
      hasMore,
      setActiveRoomId,
      loading,
      activeRoomId,
      fetchChats,
      onLineUser,
      isTyping,
    }),
    [
      chats,
      hasMore,
      setActiveRoomId,
      loading,
      activeRoomId,
      fetchChats,
      onLineUser,
      isTyping,
    ]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default ChatListProvider;

export const useChatListContext = () => useContext(Context);
