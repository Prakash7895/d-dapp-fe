export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type SexualOrientation = 'MALE' | 'FEMALE' | 'BOTH' | 'OTHER';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: Gender;
  sexualOrientation: SexualOrientation;
  selectedAddress: string;
  createdAt: string;
  updatedAt: string;
  linkedAddresses: string[];
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
