import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
}

// Use a proxy to lazily initialize PrismaClient only when a method is actually called.
// This prevents build failures when DATABASE_URL is not set during static analysis.
export const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop: string | symbol) {
        const client = getPrismaClient();
        const value = client[prop as keyof PrismaClient];
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    },
});
