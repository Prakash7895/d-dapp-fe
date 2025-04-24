import React, { FC, ReactNode, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStateContext } from '../StateProvider';
import { Id, toast } from 'react-toastify';

let socket: Socket | null = null;

export const getSocket = (accessToken?: string): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export enum CHAT_EVENTS {
  NEW_MESSAGE = 'newMessage',
  INITIAL_ONLINE_STATUSES = 'initialOnlineStatuses',
  USER_TYPING = 'userTyping',
  MESSAGE_STATUS = 'messageStatus',
}

export enum EMIT_EVENTS {
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  SEND_MESSAGE = 'sendMessage',
  START_TYPING = 'startTyping',
  STOP_TYPING = 'stopTyping',
  MESSAGE_RECEIVED = 'messageReceived',
  MESSAGE_READ = 'messageRead',
}

const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { userInfo } = useStateContext();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      console.log('Access token is missing');
    }

    if (userInfo && accessToken) {
      const socket = getSocket(accessToken);
      console.log('socket', socket);

      socket.on('connect', () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
      });

      return () => {
        console.log('Cleaning up socket listeners');
        socket.off('connect');
        socket.off('connect_error');
      };
    }
  }, [userInfo]);

  useEffect(() => {
    if (isConnected) {
      const socket = getSocket();

      socket.removeListener(CHAT_EVENTS.NEW_MESSAGE);

      let toastId: Id;
      socket.on(CHAT_EVENTS.NEW_MESSAGE, (message) => {
        console.log('New message received:', message);

        socket.emit(EMIT_EVENTS.MESSAGE_RECEIVED, { messageId: message.id });

        const newMessage = {
          id: message.id,
          content: message.content,
          firstName: message.sender?.profile?.firstName,
          lastName: message.sender?.profile?.lastName,
          profilePicture: message.sender?.profile?.profilePicture,
        };

        const isToastActive = toast.isActive(toastId);

        if (!isToastActive) {
          toastId = toast.info(
            <div className='flex items-center gap-4'>
              <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold'>
                {}
                {newMessage.profilePicture ? (
                  <img
                    src={newMessage?.profilePicture}
                    alt=''
                    className='w-10 h-10 rounded-full'
                  />
                ) : (
                  newMessage.firstName?.[0]
                )}
              </div>
              <div>
                <p className='text-white font-medium'>
                  {newMessage.firstName} {newMessage.lastName}
                </p>
                <p className='text-gray-300 text-sm'>{newMessage.content}</p>
              </div>
            </div>,
            {
              toastId: newMessage.id,
              className: 'bg-gray-800 text-white rounded-lg shadow-lg',
              progressClassName: 'bg-primary-500',
              icon: false,
              closeButton: false,
              autoClose: 5000,
              hideProgressBar: false,
              position: 'top-right',
            }
          );
        }
      });

      return () => {
        socket?.off(CHAT_EVENTS.NEW_MESSAGE);
      };
    }
  }, [isConnected]);

  return <>{children}</>;
};

export default ChatProvider;
