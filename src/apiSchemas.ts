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

export const passwordSchema = z
  .string()
  .trim()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    'Password must contain at least one special character'
  );

export const walletAddressSchema = z
  .string()
  .trim()
  .refine(isAddress, 'address must be valid wallet address');

export const emailSchema = z.string().trim().email();

export const userUpdateSchema = z.object({
  age: z.number().optional(),
  lastName: z.string().trim().optional(),
  firstName: z.string().trim().optional(),
  gender: z.enum(GENDER).optional(),
  sexualOrientation: z.enum(SEXUAL_ORIENTATION).optional(),
  selectedAddress: walletAddressSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
});

export type UserUpdateSchemaType = z.infer<typeof userUpdateSchema>;

export const createUserSchema = z
  .object({
    age: z.number(),
    lastName: z.string().trim().nonempty(),
    firstName: z.string().trim().nonempty(),
    gender: z.enum(GENDER),
    sexualOrientation: z.enum(SEXUAL_ORIENTATION),
    selectedAddress: walletAddressSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    signature: z.string().optional(),
  })
  .refine(
    (data) => {
      return (
        (data.email && data.password) ||
        (data.selectedAddress && data.signature)
      );
    },
    {
      message:
        'Either email and password or wallet address and signature is required.',
    }
  );

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;

export const addWalletAddressSchema = z.object({
  selectedAddress: walletAddressSchema,
});

export type AddWalletAddressSchemaType = z.infer<typeof addWalletAddressSchema>;
