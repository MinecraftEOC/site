import process from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '~~/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Единый экземпляр Prisma Client (singleton через `globalThis`, чтобы HMR
 * в dev не плодил подключения к БД). Автоимпортируется во всём `server/`.
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
