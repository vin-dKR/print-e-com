import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'
import { Pool } from 'pg'

// For serverless environments (like Vercel), use connection pooling
// This prevents connection exhaustion in serverless functions
const connectionString = `${process.env.DATABASE_URL}`

// Determine if we're in a serverless environment
// Only use serverless settings when actually in a serverless platform
const isServerless = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.SERVERLESS

// Create a connection pool with environment-aware settings
// For local development: more connections and longer timeouts
// For serverless: minimal connections to prevent exhaustion
const pool = new Pool({
    connectionString,
    // Connection pool settings
    max: isServerless ? 1 : 20, // More connections for local dev, limit for serverless
    idleTimeoutMillis: isServerless ? 30000 : 120000, // Longer timeout for local dev (2 minutes)
    connectionTimeoutMillis: isServerless ? 2000 : 30000, // Much longer timeout for local dev (30s)
    // Additional settings for better connection management
    allowExitOnIdle: false,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Retry configuration
    maxUses: 7500, // Reuse connections for many queries before recycling
    // Better error handling
    statement_timeout: 30000, // 30 second query timeout
    query_timeout: 30000,
})

// Handle pool errors gracefully
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('✅ Database connection established');
    }
});

pool.on('remove', () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('🔌 Database connection removed from pool');
    }
});

const adapter = new PrismaPg(pool)

// Configure Prisma Client with better error handling
const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
})

// Connection health check function with retry logic
export const checkDatabaseConnection = async (retries = 3): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$queryRaw`SELECT 1`
            return true
        } catch (error: any) {
            if (i === retries - 1) {
                console.error(`Database connection check failed after ${retries} attempts:`, error.message)
                return false
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
    }
    return false
}

// Graceful shutdown for serverless environments
if (typeof process !== 'undefined') {
    // Handle uncaught promise rejections related to database
    process.on('unhandledRejection', (error: any) => {
        if (error?.message?.includes('timeout') || error?.message?.includes('Connection')) {
            console.error('Database connection error:', error.message);
            // Don't crash the process, just log the error
        }
    });

    process.on('beforeExit', async () => {
        try {
            await prisma.$disconnect()
            await pool.end()
        } catch (error) {
            console.error('Error during database cleanup:', error);
        }
    });

    // Handle SIGINT and SIGTERM for graceful shutdown
    const shutdown = async () => {
        console.log('Shutting down database connections...');
        try {
            await prisma.$disconnect();
            await pool.end();
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

export { prisma }
