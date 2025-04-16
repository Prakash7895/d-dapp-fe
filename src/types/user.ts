'use client';

import {
  GENDER_PREFERENCES,
  GenderType,
  SexualOrientationType,
} from '@/apiSchemas';

export type IForm = {
  firstName: string;
  lastName: string;
  email: string;
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
  selectedAddress?: string;
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
};
