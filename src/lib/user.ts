import { UserUpdateSchemaType } from '@/apiSchemas';
import { prisma } from '@/lib/prisma';

export const updateUser = async (
  id: number,
  data: UserUpdateSchemaType,
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

    const { selectedAddress } = data;

    let updatedLinkedAddresses = [...Array(savedUser.linkedAddresses ?? [])];

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

        data.selectedAddress = (updatedLinkedAddresses?.[0] as string) ?? null;
      }
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

    const { password, ...userInfo } = user;

    return userInfo;
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to update user');
  }
};

export const getUserById = async (id: number) =>
  await prisma.user.findFirst({
    where: { id },
  });
