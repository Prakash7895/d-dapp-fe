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
    | AddWalletAddressSchemaType,
  removeAddress?: boolean
) => {
  try {
    const savedUser = await prisma.user.findFirst({
      where: { id: id },
      select: { linkedAddresses: true },
    });

    if (!savedUser) {
      throw new Error('User not found');
    }

    const { selectedAddress } = data as AddWalletAddressSchemaType;

    let updatedLinkedAddresses = [
      ...Array.from((savedUser.linkedAddresses as string[]) ?? []),
    ];

    if (selectedAddress) {
      const idx = updatedLinkedAddresses.findIndex(
        (e) => e === selectedAddress
      );

      if (idx < 0 && !removeAddress) {
        updatedLinkedAddresses.push(selectedAddress);
      }
      if (idx >= 0 && removeAddress) {
        updatedLinkedAddresses = updatedLinkedAddresses.filter(
          (e) => e !== selectedAddress
        );

        (data as AddWalletAddressSchemaType).selectedAddress =
          (updatedLinkedAddresses?.[0] as string) ?? null;
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
        linkedAddresses: updatedLinkedAddresses,
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
