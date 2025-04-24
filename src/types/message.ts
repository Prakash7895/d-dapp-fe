export interface ChatMessage {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  roomId: string;
  senderId: string;
  received: boolean;
  read: boolean;
  pending?: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  profileImage: string;
  isOnline: boolean;
}

export interface ChatRoom {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    isOnline: boolean;
  };
  lastMessage: ChatMessage | null;
  userId: string;
}
