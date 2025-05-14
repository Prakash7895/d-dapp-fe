// import { isAddress } from 'ethers';
import { z } from 'zod';

export const GENDER = ['MALE', 'FEMALE', 'OTHER'] as const;

export enum GENDER_PREFERENCES {
  'MALE' = 'MALE',
  'FEMALE' = 'FEMALE',
  'ALL' = 'ALL',
}

export type GenderType = (typeof GENDER)[number];

export type SexualOrientationType = (typeof SEXUAL_ORIENTATION)[number];

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

// export const walletAddressSchema = z
//   .string()
//   .trim()
//   .refine(isAddress, 'address must be valid wallet address');

export const emailSchema = z
  .string({ message: 'Email is required' })
  .trim()
  .email({ message: 'Must follow the email constraints' });

export const userUpdateSchema = z.object({
  age: z
    .number({ message: 'Age is required' })
    .min(18, 'Age should be above 18.')
    .max(50, 'Age should be below 50.'),
  lastName: z
    .string()
    .nonempty('Last Name is required')
    .trim()
    .max(30, { message: 'Last Name must contain at most 30 character(s)' }),
  firstName: z
    .string()
    .nonempty('First Name is required')
    .trim()
    .max(30, { message: 'First Name must contain at most 30 character(s)' }),
  gender: z.enum(GENDER, { message: 'Gender is required' }),
  sexualOrientation: z.enum(SEXUAL_ORIENTATION, {
    message: 'Sexual orientation is required',
  }),
  // email: emailSchema.nonempty('Email is required'),
  bio: z
    .string({ message: 'Bio is required' })
    .trim()
    .min(50, 'Minimum 50 characters are required.')
    .max(500, 'Upto 500 characters are allowed.'),
  interests: z
    .array(z.string())
    .min(1, 'Atleast 1 interest is required.')
    .max(15, 'Upto 15 Interests are allowed.'),
  city: z
    .string()
    .trim()
    .nonempty('City is required')
    .max(50, { message: 'Upto 50 characters are allowed.' }),
  country: z
    .string()
    .trim()
    .nonempty('Country is required')
    .max(30, { message: 'Upto 30 characters are allowed.' }),
  maxDistance: z.number().min(0).max(1000),
  minAge: z.number({ message: 'Min Age is required' }).min(18).max(50),
  maxAge: z.number({ message: 'Max Age is required' }).min(18).max(50),
  genderPreference: z.enum(
    [
      GENDER_PREFERENCES.ALL,
      GENDER_PREFERENCES.MALE,
      GENDER_PREFERENCES.FEMALE,
    ],
    { message: 'Gender Preference is required' }
  ),
});

export type UserUpdateSchemaType = z.infer<typeof userUpdateSchema>;

// export const createUserSchema = z
//   .object({
//     age: z.number(),
//     lastName: z.string().trim().nonempty(),
//     firstName: z.string().trim().nonempty(),
//     gender: z.enum(GENDER),
//     sexualOrientation: z.enum(SEXUAL_ORIENTATION),
//     selectedAddress: walletAddressSchema.optional(),
//     email: emailSchema.optional(),
//     password: passwordSchema.optional(),
//     signature: z.string().optional(),
//     latitude: z.number(),
//     longitude: z.number(),
//   })
//   .refine(
//     (data) => {
//       return (
//         (data.email && data.password) ||
//         (data.selectedAddress && data.signature)
//       );
//     },
//     {
//       message:
//         'Either email and password or wallet address and signature is required.',
//     }
//   );

// export type CreateUserSchemaType = z.infer<typeof createUserSchema>;

// export const addWalletAddressSchema = z.object({
//   selectedAddress: walletAddressSchema,
// });

// export type AddWalletAddressSchemaType = z.infer<typeof addWalletAddressSchema>;

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().nonempty('Confirm Password is required.'),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: 'Password and confirm password should be same.',
  });

export type UpdatePasswordSchemaType = z.infer<typeof updatePasswordSchema>;

export enum FILE_ACCESS {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

// export const fileUploadSchema = z.object({
//   file: z
//     .instanceof(File)
//     .refine(
//       (file) => file.size <= 5 * 1024 * 1024, // 5MB
//       { message: 'File size must be less than 5MB' }
//     )
//     .refine(
//       (file) => ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type),
//       { message: 'Only PNG, JPG, JPEG files are allowed' }
//     ),
//   access: z.enum([FILE_ACCESS.PRIVATE, FILE_ACCESS.PUBLIC], {
//     required_error: 'Access type is required',
//     invalid_type_error: 'Access must be either private or public',
//   }),
// });

// export const paginationQuerySchema = z.object({
//   pageNo: z.number().min(1, { message: 'PageNo should be atleast 1.' }),
//   pageSize: z
//     .number()
//     .min(1, { message: 'PageSize should be atleast 1.' })
//     .max(50, { message: 'PageSize should be not exceed 50.' }),
// });
// export type PaginationQuerySchemaType = z.infer<typeof paginationQuerySchema>;

// export const fileKeySchema = z.object({
//   key: z.string().nonempty('key is required.'),
// });

// export const likesSchema = z.object({
//   liker: walletAddressSchema,
//   target: walletAddressSchema,
// });

export const onboardingSchema = z.object({
  profilePicture: z
    .instanceof(File)
    .nullable()
    .or(z.null())
    .refine((file) => file === null || file instanceof File, {
      message: 'Profile picture must be null or a valid File.',
    }),
  bio: z
    .string()
    .min(50, { message: 'Bio must be at least 50 characters long.' }),
  city: z
    .string()
    .min(2, { message: 'City is required.' })
    .max(30, { message: 'Upto 50 characters are allowed.' }),
  country: z
    .string()
    .min(2, { message: 'Country is required.' })
    .max(20, { message: 'Upto 50 characters are allowed.' }),
  interests: z
    .array(z.string())
    .min(1, { message: 'At least one interest is required.' }),
});

export type OnboardingFormSchema = z.infer<typeof onboardingSchema>;
