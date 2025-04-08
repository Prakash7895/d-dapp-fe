import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyWalletSignature } from '@/lib/auth';
import { getUserByEmail, getUserByAddress } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      sexualOrientation,
      address,
      signature,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !age || !gender || !sexualOrientation) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists with email
    if (email) {
      const existingUserByEmail = await getUserByEmail(email);
      if (existingUserByEmail) {
        return NextResponse.json(
          { message: 'User with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Check if user already exists with wallet address
    if (address) {
      const existingUserByAddress = await getUserByAddress(address);
      if (existingUserByAddress) {
        return NextResponse.json(
          { message: 'User with this wallet address already exists' },
          { status: 400 }
        );
      }

      // Verify wallet signature if provided
      if (signature) {
        const message = `Sign up for Dating DApp with address ${address}`;
        const isValid = await verifyWalletSignature(address, signature, message);
        
        if (!isValid) {
          return NextResponse.json(
            { message: 'Invalid wallet signature' },
            { status: 400 }
          );
        }
      }
    }

    // Create user data object
    const userData: any = {
      firstName,
      lastName,
      age: parseInt(age),
      gender,
      sexualOrientation,
    };

    // Add email and password if provided
    if (email && password) {
      const hashedPassword = await hashPassword(password);
      userData.email = email;
      userData.password = hashedPassword;
    }

    // Add wallet address if provided
    if (address) {
      userData.address = address;
    }

    // Create user in database
    const user = await prisma.user.create({
      data: userData,
    });

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          address: user.address,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 