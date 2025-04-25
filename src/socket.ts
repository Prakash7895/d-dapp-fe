'use client';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from './types/message';
import { store } from './store';
import {
  addOnlineUser,
  appendOnTop,
  removeOnlineUser,
  setOnlineUsers,
  setTypingStatus,
} from './store/ChatReducer';
import axiosInstance from './apiCalls';

enum CHAT_EVENTS {
  NEW_MESSAGE = 'newMessage',
  INITIAL_ONLINE_STATUSES = 'initialOnlineStatuses',
  USER_TYPING = 'userTyping',
  MESSAGE_STATUS = 'messageStatus',
  USER_STATUS = 'userStatus',
  TOKEN_MISSING = 'tokenMissing',
  INVALID_TOKEN = 'invalidToken',
}

enum EMIT_EVENTS {
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  SEND_MESSAGE = 'sendMessage',
  START_TYPING = 'startTyping',
  STOP_TYPING = 'stopTyping',
  MESSAGE_RECEIVED = 'messageReceived',
  MESSAGE_READ = 'messageRead',
}

let socketObj: Socket | null = null;
const reconnectAttempts = 5;
const reconnectDelay = 2000;
let attempts = 0;
let timeoutId: NodeJS.Timeout | null = null;

const connect = () => {
  console.log('Initializing socket...');
  const accessToken = sessionStorage.getItem('accessToken');

  return io(process.env.NEXT_PUBLIC_WS_URL!, {
    auth: { token: accessToken },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
};

const socketEventInitializer = (socket: Socket) => {
  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);

    attachListeners(socket!);
  });

  socket.on('disconnect', (reason) => {
    console.warn('Socket disconnected:', reason);
  });

  socket.on('close', (reason) => {
    console.log('WebSocket connection closed:', reason);
  });

  socket.on('connect_error', (err) => {
    console.log('Socket connection error:', err);
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.log(`Reconnection attempt #${attempt}`);
  });

  socket.on('reconnect', () => {
    console.log('Socket successfully reconnected');
  });

  socket.on('reconnect_failed', () => {
    console.log('Socket reconnection failed');
  });
};

export const initializeSocket = () => {
  if (typeof window === 'undefined') {
    console.log('initializeSocket must be called in the browser');
    return;
  }

  if (!socketObj) {
    socketObj = connect();
    attempts = 0;
    socketEventInitializer(socketObj);

    socketObj.on(CHAT_EVENTS.TOKEN_MISSING, (error) => {
      console.log('TOKEN_MISSING:', error);
    });

    socketObj.on(CHAT_EVENTS.INVALID_TOKEN, async (error) => {
      console.log('INVALID_TOKEN:', error);
      socketObj?.disconnect();

      await axiosInstance.get('/auth/validate');

      socketObj = null;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (attempts < reconnectAttempts) {
        timeoutId = setTimeout(() => {
          initializeSocket();
          attempts++;
        }, reconnectDelay);
      }
    });
  }
};

const attachListeners = (socket: Socket) => {
  socket.removeListener(CHAT_EVENTS.NEW_MESSAGE);
  socket.on(CHAT_EVENTS.NEW_MESSAGE, (message) => {
    console.log('NEW_MESSAGE:', message);

    store.dispatch(
      appendOnTop({
        ...message.sender.profile,
        roomId: message.roomId,
        lastMessage: message,
        unreadCount: message.unreadCount,
      })
    );

    socket.emit(EMIT_EVENTS.MESSAGE_RECEIVED, { messageId: message.id });
  });

  const listener = socket.listeners(CHAT_EVENTS.NEW_MESSAGE);
  console.log('Listeners for NEW_MESSAGE:', listener);

  socket.removeListener(CHAT_EVENTS.INITIAL_ONLINE_STATUSES);
  socket.on(
    CHAT_EVENTS.INITIAL_ONLINE_STATUSES,
    (users: { userId: string; online: boolean }[]) => {
      console.log('INITIAL_ONLINE_STATUSES:', users);
      store.dispatch(
        setOnlineUsers(
          users.filter((user) => user.online).map((user) => user.userId)
        )
      );
    }
  );

  socket.removeListener(CHAT_EVENTS.USER_TYPING);
  socket.on(
    CHAT_EVENTS.USER_TYPING,
    (message: { roomId: string; userId: string; typing: boolean }) => {
      console.log('USER_TYPING:', message);

      store.dispatch(setTypingStatus(message));
    }
  );

  socket.removeListener(CHAT_EVENTS.USER_STATUS);
  socket.on(
    CHAT_EVENTS.USER_STATUS,
    (status: { userId: string; online: boolean }) => {
      console.log('USER_STATUS:', status);

      if (status.online) {
        store.dispatch(addOnlineUser(status.userId));
      } else {
        store.dispatch(removeOnlineUser(status.userId));
      }
    }
  );

  socket.removeListener(CHAT_EVENTS.MESSAGE_STATUS);
  socket.on(
    CHAT_EVENTS.MESSAGE_STATUS,
    (message: { messageId: string; status: 'received' | 'read' }) => {
      console.log('MESSAGE_STATUS:', message);
      //   setMessages((prev) => {
      //     const idx = prev.findIndex((msg) => msg.id === message.messageId);
      //     if (idx >= 0) {
      //       return prev.map((msg) => {
      //         if (msg.id === message.messageId) {
      //           return {
      //             ...msg,
      //             [message.status]: true,
      //             pending: false,
      //           };
      //         }
      //         return msg;
      //       });
      //     }
      //     return prev;
      //   });
    }
  );
};

const checkStatus = () => {
  if (!socketObj) {
    console.log('Socket is not initialized');
    return false;
  }
  if (!socketObj.connected) {
    console.log('Socket is not connected');
    return false;
  }

  return socketObj.connected;
};

export const sendMessage = (
  content: string,
  roomId: string,
  callback: (msg: ChatMessage) => void
) => {
  console.log('CALLING SEND MESSAGE');
  if (checkStatus()) {
    socketObj!.emit(
      EMIT_EVENTS.SEND_MESSAGE,
      { roomId, content },
      (message: ChatMessage) => callback(message)
    );
  }
};

export const startTyping = (roomId: string) => {
  if (checkStatus() && roomId) {
    socketObj?.emit(EMIT_EVENTS.START_TYPING, { roomId });
  }
};

export const stopTyping = (roomId: string) => {
  if (checkStatus() && roomId) {
    socketObj?.emit(EMIT_EVENTS.STOP_TYPING, { roomId });
  }
};
