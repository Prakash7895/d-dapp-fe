import {
  AddWalletAddressSchemaType,
  UpdatePasswordSchemaType,
  UserUpdateSchemaType,
} from '@/apiSchemas';
import { prisma } from '@/lib/prisma';
import { hashPassword } from './auth';

export const updateUser = async (
  id: number,
  data:
    | UserUpdateSchemaType
    | UpdatePasswordSchemaType
    | AddWalletAddressSchemaType
) => {
  try {
    const savedUser = await prisma.user.findFirst({
      where: { id: id },
      select: { UserWalletAddresses: true },
    });

    if (!savedUser) {
      throw new Error('User not found');
    }

    const { selectedAddress } = data as AddWalletAddressSchemaType;
    if (selectedAddress) {
      const addressExists = savedUser.UserWalletAddresses.some(
        (address) => address.address === selectedAddress
      );
      if (!addressExists) {
        await prisma.userWalletAddresses.create({
          data: {
            address: selectedAddress.toLowerCase(),
            userId: id,
          },
        });
      }
    }

    const passwordData = data as UpdatePasswordSchemaType;
    if (passwordData.password) {
      const hashedPassword = await hashPassword(passwordData.password);
      (passwordData as UpdatePasswordSchemaType).password = hashedPassword;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...updateData } = passwordData;
      data = updateData as UpdatePasswordSchemaType;
    }

    const user = await prisma.user.update({
      where: {
        id: +id,
      },
      data: {
        ...data,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userInfo } = user;

    return userInfo;
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(error?.message || 'Failed to update user');
  }
};

export const getUserById = async (id: number) =>
  await prisma.user.findFirst({
    where: { id },
  });

export async function updateUserLastActive(id: number) {
  return prisma.user.update({
    where: { id },
    data: {
      lastActiveOn: new Date(),
    },
  });
}
