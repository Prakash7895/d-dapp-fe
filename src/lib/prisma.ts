import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();
//   {
//   log: ['query'],
// }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Function to check the database connection
export const checkDatabaseConnection = async () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    console.warn('Attempting to connect to database from browser environment');
    return;
  }

  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Call the function to check the connection
checkDatabaseConnection();
