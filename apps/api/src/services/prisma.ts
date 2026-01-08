// db.ts
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

declare global {
    // eslint-disable-next-line no-var
    var _pgPool: Pool | undefined;
    // eslint-disable-next-line no-var
    var _prisma: PrismaClient | undefined;
}

let connectionString = `${process.env.DATABASE_URL}`;

const isServerless =
    process.env.VERCEL === '1' ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.SERVERLESS;

const isNeon =
    connectionString.includes('neon.tech') ||
    connectionString.includes('neon');

// Neon optimization: only adjust URL, don't overdo pool options
if (isNeon && isServerless) {
    try {
        const url = new URL(connectionString);

        if (!url.hostname.includes('-pooler')) {
            url.hostname = url.hostname.replace(/\.neon\.tech/, '-pooler.neon.tech');
        }

        url.searchParams.set('sslmode', 'require');
        url.searchParams.set('connect_timeout', '15');
        url.searchParams.set('pool_timeout', '10');

        connectionString = url.toString();
    } catch (error) {
        console.warn('Could not optimize Neon connection string:', error);
    }
}

// 1) Create or reuse a single Pool per runtime
if (!global._pgPool) {
    global._pgPool = new Pool({
        connectionString,
        max: isServerless ? 5 : 20,          // not 1 and not maxUses:1
        idleTimeoutMillis: isServerless ? 30000 : 120000,
        connectionTimeoutMillis: isServerless ? 15000 : 30000,
        allowExitOnIdle: false,             // <– keep pool alive in runtime
        keepAlive: true,
        statement_timeout: isServerless ? 25000 : 30000,
        query_timeout: isServerless ? 25000 : 30000,
    });

    global._pgPool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
    });
}

const pool = global._pgPool;

// 2) Create or reuse a single Prisma client per runtime
if (!global._prisma) {
    const adapter = new PrismaPg(pool);
    global._prisma = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        errorFormat: 'pretty',
    });

    // optional: don't connect at module import time; let the first query connect
}

const prisma = global._prisma!;

// Lightweight health check
export const checkDatabaseConnection = async (retries = 3): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (error: any) {
            if (i === retries - 1) {
                console.error(`DB connection check failed after ${retries} attempts:`, error.message);
                return false;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
    return false;
};

export { prisma };
