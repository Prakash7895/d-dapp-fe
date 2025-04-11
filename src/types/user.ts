export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type SexualOrientation = 'MALE' | 'FEMALE' | 'BOTH' | 'OTHER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  gender?: Gender;
  sexualOrientation?: SexualOrientation;
  selectedAddress?: string;
  password?: string;
  bio?: string;
  interests?: string[];
  location?: {
    city: string;
    country: string;
  };
  preferences?: {
    maxDistance?: number;
    ageRange?: {
      min?: number;
      max?: number;
    };
    showMe?: 'MALE' | 'FEMALE' | 'ALL';
  };
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  age: number | string;
  gender: string;
  sexualOrientation: string;
  email: string;
  password: string;
}
