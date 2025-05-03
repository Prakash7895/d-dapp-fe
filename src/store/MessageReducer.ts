import { ChatMessage } from '@/types/message';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PAGE_SIZE } from './ChatReducer';
import { fetchMessages } from './thunk';

interface MessageState {
  messages: ChatMessage[];
  hasMore: boolean;
  loading: boolean;
  pageNo: number;
}

const initialState: MessageState = {
  messages: [],
  hasMore: true,
  loading: false,
  pageNo: 1,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    resetMessages: () => initialState,
    addNewMessage: (state, action: PayloadAction<ChatMessage>) => {
      const newMessage = action.payload;
      const roomIdMatch = state.messages[0]?.roomId === newMessage.roomId;

      if (roomIdMatch) {
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
    updateMessageStatus: (
      state,
      action: PayloadAction<{ messageId: string; status: 'received' | 'read' }>
    ) => {
      const messageId = action.payload.messageId;
      const updatedMessages = state.messages.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            [action.payload.status]: true,
          };
        }
        return msg;
      });
      state.messages = updatedMessages;
    },
    updateMessageStatusByRoomId: (
      state,
      action: PayloadAction<{ roomId: string }>
    ) => {
      const activeRoomId = state.messages[0]?.roomId;
      if (activeRoomId === action.payload.roomId) {
        const updatedMessages = state.messages.map((msg) => {
          return {
            ...msg,
            received: true,
          };
        });
        state.messages = updatedMessages;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;

        const existingMessages = state.messages.map((msg) => ({ ...msg }));

        const newMessages = action.payload.data?.filter(
          (msg) =>
            !existingMessages.some((existingMsg) => existingMsg.id === msg.id)
        );
        if (newMessages) {
          if (state.pageNo === 1) {
            state.messages = newMessages;
          } else {
            state.messages = [...existingMessages, ...newMessages];
          }
        }
        state.hasMore = action.payload.data!.length! >= PAGE_SIZE;
        state.pageNo = action.payload.page;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.loading = false;
        console.log('Failed to fetch messages');
      });
  },
});

export const {
  resetMessages,
  addNewMessage,
  updateMessage,
  updateMessageStatus,
  updateMessageStatusByRoomId,
} = messageSlice.actions;
export default messageSlice.reducer;
