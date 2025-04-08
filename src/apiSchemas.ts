import { isAddress } from 'ethers';
import { z } from 'zod';

export const GENDER = ['MALE', 'FEMALE', 'NON-BINARY', 'OTHER'] as const;

export const SEXUAL_ORIENTATION = [
  'STRAIGHT',
  'GAY',
  'LESBIAN',
  'BISEXUAL',
  'PANSEXUAL',
  'ASEXUAL',
  'OTHER',
] as const;

export const userSchema = z.object({
  age: z.number({ message: 'age must be number greater than 0.' }),
  lastName: z.string(),
  firstName: z.string(),
  gender: z.enum(GENDER),
  sexualOrientation: z.enum(SEXUAL_ORIENTATION),
  address: z.custom(isAddress, 'address must be valid wallet address'),
});

export const addressSchema = z
  .string()
  .nonempty('address is required')
  .refine(isAddress, 'Invalid Address');

export const userUpdateSchema = z.object({
  age: z.number().optional(),
  lastName: z.string().optional(),
  firstName: z.string().optional(),
  gender: z.enum(GENDER).optional(),
  sexualOrientation: z.enum(SEXUAL_ORIENTATION).optional(),
});
