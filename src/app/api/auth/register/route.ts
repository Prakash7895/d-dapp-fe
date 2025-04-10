import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyWalletSignature } from '@/lib/auth';
import { getUserByEmail, getUserByAddress } from '@/lib/auth';
import { createUserSchema, CreateUserSchemaType } from '@/apiSchemas';

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserSchemaType = await request.json();

    const validationResult = createUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      sexualOrientation,
      selectedAddress,
      signature,
    } = body;

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

    if (selectedAddress) {
      // Check if user already exists with wallet address
      const existingUserByAddress = await getUserByAddress(selectedAddress);
      if (existingUserByAddress) {
        return NextResponse.json(
          { message: 'User with this wallet address already exists' },
          { status: 400 }
        );
      }

      // Verify wallet signature if provided
      if (signature) {
        const message = `${process.env.NEXT_PUBLIC_MESSAGE_TO_VERIFY}${selectedAddress}`;
        const isValid = await verifyWalletSignature(
          selectedAddress,
          signature,
          message
        );

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
      age: +age,
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
    if (selectedAddress) {
      userData.selectedAddress = selectedAddress;
      userData.linkedAddresses = [selectedAddress];
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
          selectedAddress: user.selectedAddress,
        },
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
