import { isAddress } from 'ethers';
import { z } from 'zod';

export const GENDER = ['MALE', 'FEMALE', 'TRANS'] as const;

export const SEXUAL_ORIENTATION = ['MALE', 'FEMALE', 'ALL'] as const;

export const userSchema = z.object({
  age: z.number(),
  lastName: z.string(),
  firstName: z.string(),
  gender: z.enum(GENDER),
  sexualOrientation: z.enum(SEXUAL_ORIENTATION),
  address: z.custom(isAddress, 'Invalid Address'),
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
