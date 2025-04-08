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
    console.error('Error verifying wallet signature:', error);
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
    where: { address },
  });
}

export async function createUser(data: {
  email?: string;
  password?: string;
  address?: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  sexualOrientation: string;
  image?: string;
}) {
  // Ensure required fields are provided
  const { firstName, lastName, age, gender, sexualOrientation } = data;

  // Create user with required fields
  return prisma.user.create({
    data: {
      firstName,
      lastName,
      age,
      gender,
      sexualOrientation,
      // Add optional fields if they exist
      ...(data.email && { email: data.email }),
      ...(data.password && { password: data.password }),
      ...(data.address && { address: data.address }),
    },
  });
}
