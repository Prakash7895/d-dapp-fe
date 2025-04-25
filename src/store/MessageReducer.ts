import { ChatMessage } from '@/types/message';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PAGE_SIZE } from './ChatReducer';

interface MessageState {
  messages: ChatMessage[];
  hasMore: boolean;
  loading: boolean;
  pageNo: number;
}

const initialState: MessageState = {
  messages: [],
  hasMore: false,
  loading: false,
  pageNo: 1,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    resetMessages: (state) => {
      state.messages = [];
      state.hasMore = false;
      state.loading = false;
      state.pageNo = 1;
    },
    setMessages: (
      state,
      action: PayloadAction<{ data: ChatMessage[]; page: number }>
    ) => {
      const existingMessages = state.messages.map((msg) => ({ ...msg }));

      const newMessages = action.payload.data.filter(
        (msg) =>
          !existingMessages.some((existingMsg) => existingMsg.id === msg.id)
      );
      state.messages = [...existingMessages, ...newMessages];
      state.hasMore = action.payload?.data?.length >= PAGE_SIZE;
      state.pageNo = action.payload.page;
      state.loading = false;
    },
    addNewMessage: (state, action: PayloadAction<ChatMessage>) => {
      const newMessage = action.payload;
      const existingMessageIndex = state.messages.findIndex(
        (msg) => msg.id === newMessage.id
      );
      if (existingMessageIndex >= 0) {
        state.messages[existingMessageIndex] = {
          ...state.messages[existingMessageIndex],
          ...newMessage,
        };
      } else {
        state.messages.unshift(newMessage);
      }
    },
    updateMessage: (
      state,
      action: PayloadAction<{ messageId: string; data: Partial<ChatMessage> }>
    ) => {
      const newMessage = action.payload.data;
      const messageId = action.payload.messageId;

      const updatedMessages = state.messages.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            ...newMessage,
          };
        }
        return msg;
      });
      state.messages = updatedMessages;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setMessages,
  setLoading,
  resetMessages,
  addNewMessage,
  updateMessage,
} = messageSlice.actions;
export default messageSlice.reducer;
