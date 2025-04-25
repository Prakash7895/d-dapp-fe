import { ChatUser } from '@/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    setChats: (
      state,
      action: PayloadAction<{ data: ChatUser[]; page: number }>
    ) => {
      const existingChats = state.chats.map((chat) => ({ ...chat }));

      const newChats = action.payload.data.filter(
        (chat) =>
          !existingChats.some(
            (existingChat) => existingChat.roomId === chat.roomId
          )
      );
      state.chats = [...existingChats, ...newChats];
      state.hasMore = action.payload.data.length >= PAGE_SIZE;
      state.pageNo = action.payload.page;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
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
  },
});

export const {
  setActiveRoomId,
  setChats,
  setLoading,
  setOnlineUsers,
  appendOnTop,
  setTypingStatus,
  addOnlineUser,
  removeOnlineUser,
} = chatSlice.actions;
export default chatSlice.reducer;
