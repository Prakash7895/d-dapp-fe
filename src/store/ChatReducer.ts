import { ChatMessage } from '@/types/message';
import { ChatUser } from '@/types/user';
import { deepClone } from '@/utils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchChats } from './thunk';

export const PAGE_SIZE = 20;

interface ChatState {
  chats: ChatUser[];
  hasMore: boolean;
  loading: boolean;
  activeRoomId: string;
  pageNo: number;
  onlineUsers: string[];
  typingUsers: { roomId: string; userId: string }[];
}

const initialState: ChatState = {
  chats: [],
  hasMore: true,
  loading: false,
  activeRoomId: '',
  pageNo: 1,
  onlineUsers: [],
  typingUsers: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    resetChats: () => initialState,
    setActiveRoomId: (state, action: PayloadAction<string>) => {
      state.activeRoomId = action.payload;
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      const updatedData = state.onlineUsers.filter((u) => u !== userId);
      updatedData.push(userId);

      state.onlineUsers = updatedData;
    },
    removeOnlineUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      const updatedData = state.onlineUsers.filter((u) => u !== userId);
      const updatedTypingUsers = state.typingUsers.filter(
        (u) => u.userId !== userId
      );

      state.onlineUsers = updatedData;
      state.typingUsers = updatedTypingUsers;
    },
    appendOnTop: (state, action: PayloadAction<ChatUser>) => {
      const newChat = action.payload;
      const updatedChats = state.chats.filter(
        (el) => el.roomId !== newChat.roomId
      );
      updatedChats.unshift(newChat);
      state.chats = updatedChats;
    },
    updateLatestMessage: (state, action: PayloadAction<ChatMessage>) => {
      const newMessage = action.payload;
      const chat = deepClone(
        state.chats.find((el) => el.roomId === newMessage.roomId)
      );

      if (chat) {
        chat.lastMessage = newMessage;
      }

      const updatedChats = deepClone(state.chats).filter(
        (el) => el.roomId !== chat?.roomId
      );

      updatedChats.unshift(chat!);

      return {
        ...state,
        chats: updatedChats,
      };
    },
    setTypingStatus: (
      state,
      action: PayloadAction<{
        roomId: string;
        userId: string;
        typing: boolean;
      }>
    ) => {
      const userId = action.payload.userId;
      const updatedData = state.typingUsers.filter((u) => u.userId !== userId);
      const updateOnlineUsers = state.onlineUsers.filter((u) => u !== userId);
      if (action.payload.typing) {
        updatedData.push({ userId, roomId: action.payload.roomId });
        updateOnlineUsers.push(userId);
      }

      state.typingUsers = updatedData;
      state.onlineUsers = updateOnlineUsers;
    },
    decrementUnreadCount: (
      state,
      action: PayloadAction<{ roomId: string }>
    ) => {
      const roomId = action.payload.roomId;

      // Find the chat and decrement its unreadCount
      const updatedChats = state.chats.map((chat) => {
        if (chat.roomId === roomId && chat.unreadCount > 0) {
          return {
            ...chat,
            unreadCount: chat.unreadCount - 1,
          };
        }
        return chat;
      });

      state.chats = updatedChats;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        const existingChats = state.chats.map((chat) => ({ ...chat }));

        const newChats = action.payload.data?.filter(
          (chat) =>
            !existingChats.some(
              (existingChat) => existingChat.roomId === chat.roomId
            )
        );
        state.chats = [...existingChats, ...(newChats || [])];
        state.hasMore = action.payload.data?.length! >= PAGE_SIZE;
        state.pageNo = action.payload.page;
      })
      .addCase(fetchChats.rejected, (state) => {
        state.loading = false;
        console.log('Failed to fetch chats');
      });
  },
});

export const {
  resetChats,
  setActiveRoomId,
  setOnlineUsers,
  appendOnTop,
  setTypingStatus,
  addOnlineUser,
  removeOnlineUser,
  updateLatestMessage,
  decrementUnreadCount,
} = chatSlice.actions;
export default chatSlice.reducer;
