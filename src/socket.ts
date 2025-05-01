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
import {
  addNewMessage,
  updateMessageStatus,
  updateMessageStatusByRoomId,
} from './store/MessageReducer';
import { MatchedUserResponse } from './types/user';
import { setMatchedWith } from './store/MatchReducer';

enum CHAT_EVENTS {
  NEW_MESSAGE = 'newMessage',
  INITIAL_ONLINE_STATUSES = 'initialOnlineStatuses',
  USER_TYPING = 'userTyping',
  MESSAGE_STATUS = 'messageStatus',
  USER_STATUS = 'userStatus',
  TOKEN_MISSING = 'tokenMissing',
  INVALID_TOKEN = 'invalidToken',
  MARK_ALL_RECEIVED = 'markAllReceived',
  NEW_MATCH_EVENT = 'newMatchEvent',
}

enum EMIT_EVENTS {
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  SEND_MESSAGE = 'sendMessage',
  START_TYPING = 'startTyping',
  STOP_TYPING = 'stopTyping',
  MESSAGE_RECEIVED = 'messageReceived',
  MESSAGE_READ = 'messageRead',
  LOG_OUT = 'logOut',
  HEART_BEAT = 'heartbeat',
}

let socketObj: Socket | null = null;
const reconnectAttempts = 5;
const reconnectDelay = 2000;
let attempts = 0;
let timeoutId: NodeJS.Timeout | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

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

    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
    heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit(EMIT_EVENTS.HEART_BEAT, (status: any) => {
          console.log('Heartbeat sent', status);
        });
      }
    }, 5000);

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

      reconnectSocket();
    });
  }
};

const reconnectSocket = () => {
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

    store.dispatch(addNewMessage(message));

    socket.emit(EMIT_EVENTS.MESSAGE_RECEIVED, { messageId: message.id });
  });

  const listener = socket.listeners(CHAT_EVENTS.NEW_MESSAGE);
  console.log('Listeners for NEW_MESSAGE:', listener);

  socket.removeListener(CHAT_EVENTS.INITIAL_ONLINE_STATUSES);
  socket.on(
    CHAT_EVENTS.INITIAL_ONLINE_STATUSES,
    (users: { userId: string; online: boolean }[]) => {
      console.log('INITIAL_ONLINE_STATUSES:', users);
      const userIds = users
        .filter((user) => user.online)
        .map((user) => user.userId);
      store.dispatch(setOnlineUsers(userIds));
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
      store.dispatch(updateMessageStatus(message));
    }
  );

  socket.removeListener(CHAT_EVENTS.MARK_ALL_RECEIVED);
  socket.on(CHAT_EVENTS.MARK_ALL_RECEIVED, (message: { roomId: string }) => {
    console.log('MARK_ALL_RECEIVED:', message);

    store.dispatch(updateMessageStatusByRoomId(message));
  });

  socket.removeListener(CHAT_EVENTS.NEW_MATCH_EVENT);
  socket.on(CHAT_EVENTS.NEW_MATCH_EVENT, (data: MatchedUserResponse) => {
    console.log('NEW_MATCH_EVENT:', data);
    store.dispatch(setMatchedWith(data));
  });
};

const checkStatus = () => {
  if (!socketObj) {
    console.log('Socket is not initialized');

    reconnectSocket();
    return false;
  }
  if (!socketObj.connected) {
    console.log('Socket is not connected');
    return false;
  }
  console.log('SOCKET STATUS', socketObj.connected);
  return socketObj.connected;
};

export const sendMessage = (
  content: string,
  roomId: string,
  callback: (msg: ChatMessage | null) => void
) => {
  console.log('CALLING SEND MESSAGE', checkStatus());
  if (checkStatus()) {
    socketObj!.emit(
      EMIT_EVENTS.SEND_MESSAGE,
      { roomId, content },
      (message: ChatMessage) => callback(message)
    );
  } else {
    callback(null);
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

export const markReadMessage = (
  messageId: string,
  callback: (res: any) => void
) => {
  console.log('CALLING MARK READ MESSAGE', checkStatus());
  if (checkStatus()) {
    socketObj?.emit(
      EMIT_EVENTS.MESSAGE_READ,
      { messageId },
      (response: any) => {
        callback(response);
      }
    );
  }
};

export const disconnectSocket = () => {
  console.log('Disconnecting socket...', checkStatus());

  if (socketObj) {
    socketObj.emit(EMIT_EVENTS.LOG_OUT);
    socketObj.disconnect();
    socketObj = null;
  }
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  console.log('WebSocket disconnected on logout');
};
