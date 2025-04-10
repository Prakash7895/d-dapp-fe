import { prisma } from './prisma';
import { compare, hash } from 'bcrypt';
import { ethers } from 'ethers';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function verifyWalletSignature(
  address: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

export async function getUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email },
  });
}

export async function getUserByAddress(address: string) {
  return prisma.user.findFirst({
    where: {
      OR: [
        { selectedAddress: { equals: address, mode: 'insensitive' } },
        {
          linkedAddresses: {
            array_contains: address,
            mode: 'insensitive',
          },
        },
      ],
    },
  });
}
