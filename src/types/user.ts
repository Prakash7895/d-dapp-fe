'use client';

import {
  GENDER_PREFERENCES,
  GenderType,
  SexualOrientationType,
} from '@/apiSchemas';
import { MultiSigWallet } from './wallet';
import { ChatMessage } from './message';

export type IForm = {
  firstName: string;
  lastName: string;
  // email: string;
  age: number;
  gender: GenderType;
  sexualOrientation: SexualOrientationType;
  bio: string;
  interests: string[];
  city: string;
  country: string;
  maxDistance: number;
  minAge: number;
  maxAge: number;
  genderPreference: GENDER_PREFERENCES;
};

export type User = IForm & {
  id: string;
  walletAddress?: string;
  password?: string;
  linkedAddresses?: string[];
  profilePicture?: string;
};

export interface UserFormData {
  firstName: string;
  lastName: string;
  age: number | string;
  gender: string;
  sexualOrientation: string;
  email: string;
  password: string;
}

type ProfileCardForm = Omit<IForm, 'email' | 'minAge' | 'maxAge'>;

export type ProfileCard = ProfileCardForm & {
  id: number;
  photos: string[];
  profilePicture?: string;
  lastActiveOn?: string;
  linkedAddresses?: string[];
  selectedAddress?: string;
};

export type JwtPayload = {
  userId: string;
  email: string | null;
  walletAddress: string | null;
  firstName: string | null;
  lastName: string | null;
};

export interface SessionResponse {
  user: JwtPayload | null;
  expires: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  age: number | null;
  gender: GenderType | null;
  sexualOrientation: SexualOrientationType | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  interests: string[] | null;
  latitude: number | null;
  longitude: number | null;
  maxDistance: number | null;
  minAge: number | null;
  maxAge: number | null;
  genderPreference: GENDER_PREFERENCES | null;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  email: string | null;
  profile: UserProfile;
  walletAddress: string | null;
  unreadNotifications: number;
}

export type AllUsers = UserResponse & {
  lastActiveOn: string | null;
  files: string[];
  nudgedAt: string | null;
};

export type LikdedUser = AllUsers & {
  likedAt: string;
  isMatched: boolean;
  chatRoomId: string | null;
};

export type MatchedUser = AllUsers & {
  matchedAt: string;
  addressA: string;
  addressB: string;
  chatRoomId: string;
};

export type UserByAddress = UserResponse & {
  lastActiveOn: string | null;
  multiSigWallet: Omit<MultiSigWallet, 'userA' | 'userB'>;
};

export type ChatUser = UserProfile & {
  roomId: string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  unreceivedCount: number;
};

export type MatchedUserResponse = UserResponse & {
  multiSigWallet: Omit<MultiSigWallet, 'userA' | 'userB'>;
  userAId: string;
  userBId: string;
  chatRoomId: string;
};

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  nudgerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: boolean;
}

export enum SignInType {
  EMAIL = 'email',
  WALLET = 'wallet',
}

export type IUserData = Omit<UserResponse, 'unreadNotifications'> & {
  files: string[];
  likedAt: string;
  matchedAt: string | null;
  chatRoomId: string | null;
  nfts: string[];
  isVerified: boolean;
};
