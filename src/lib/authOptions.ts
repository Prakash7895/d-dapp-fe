import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import {
  getUserByEmail,
  getUserByAddress,
  verifyPassword,
  verifyWalletSignature,
} from '@/lib/auth';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      address?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    address?: string | null;
  }
}

// Extend the JWT type
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    address?: string | null;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password');
        }

        const user = await getUserByEmail(credentials.email);

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          address: user.selectedAddress || null,
        };
      },
    }),
    CredentialsProvider({
      id: 'wallet',
      name: 'Wallet Address',
      credentials: {
        address: { label: 'Wallet Address', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature) {
          throw new Error('Wallet address and signature are required');
        }

        const user = await getUserByAddress(credentials.address);

        if (!user) {
          throw new Error(
            'No account found with this wallet address. Please sign up first or try another wallet address.'
          );
        }

        // Verify the signature
        const message = `${process.env.NEXT_PUBLIC_MESSAGE_TO_VERIFY}${credentials.address}`;
        const isValid = await verifyWalletSignature(
          credentials.address,
          credentials.signature,
          message
        );

        if (!isValid) {
          throw new Error('Invalid signature. Please try signing again.');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          address: user.selectedAddress || null,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = user.id;
        token.address = user.address || null;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.address = token.address || null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Disable email verification
  events: {
    async signIn({ user }) {
      // You can add custom logic here when a user signs in
      console.log(`User ${user.email || user.id} signed in`);
    },
  },
};
