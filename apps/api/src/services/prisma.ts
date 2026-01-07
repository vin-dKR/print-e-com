import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'
import { Pool } from 'pg'

// For serverless environments (like Vercel), use connection pooling
// This prevents connection exhaustion in serverless functions
let connectionString = `${process.env.DATABASE_URL}`

// Determine if we're in a serverless environment
// Only use serverless settings when actually in a serverless platform
const isServerless = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.SERVERLESS

// Optimize connection string for Neon DB
// Neon requires specific parameters for optimal pooling in serverless
const isNeon = connectionString.includes('neon.tech') || connectionString.includes('neon')
if (isNeon && isServerless) {
    try {
        const url = new URL(connectionString)

        // Ensure we're using Neon's pooler (add -pooler to hostname if not present)
        if (!url.hostname.includes('-pooler')) {
            url.hostname = url.hostname.replace(/\.neon\.tech/, '-pooler.neon.tech')
        }

        // Add Neon-optimized connection parameters
        url.searchParams.set('sslmode', 'require')
        url.searchParams.set('connect_timeout', '15') // Neon recommends 15s for serverless
        url.searchParams.set('pool_timeout', '10')

        connectionString = url.toString()

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Neon connection string optimized for serverless')
        }
    } catch (error) {
        // If URL parsing fails, use original connection string
        console.warn('Could not optimize Neon connection string:', error)
    }
}

// Create a connection pool with environment-aware settings optimized for Neon
// For local development: more connections and longer timeouts
// For serverless: minimal connections to prevent exhaustion
const pool = new Pool({
    connectionString,
    // Connection pool settings optimized for Neon/Vercel
    max: isServerless ? 1 : 20, // Single connection per serverless function (Neon pooler handles the rest)
    min: 0, // Don't maintain idle connections in serverless
    idleTimeoutMillis: isServerless ? 10000 : 120000, // Shorter for serverless (10s)
    connectionTimeoutMillis: isServerless ? 15000 : 30000, // 15s for Neon serverless (was 2s - too short!)
    // Additional settings for better connection management
    allowExitOnIdle: isServerless, // Allow exit on idle for serverless
    keepAlive: !isServerless, // Only keep alive for non-serverless
    keepAliveInitialDelayMillis: isServerless ? 0 : 10000,
    // Retry configuration
    maxUses: isServerless ? 1 : 7500, // Single use per connection in serverless
    // Better error handling - Neon can have cold start delays
    statement_timeout: isServerless ? 25000 : 30000, // 25s for serverless
    query_timeout: isServerless ? 25000 : 30000,
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

// Configure Prisma Client with optimized settings for Neon
const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'], // Removed 'query' to reduce overhead
    errorFormat: 'pretty',
})

// Enable connection caching for better performance with Neon
// This helps reuse connections across requests in serverless
if (isServerless && isNeon) {
    // Warm up the connection on first use (helps with Neon cold starts)
    prisma.$connect().catch(() => {
        // Ignore initial connection errors, will retry on first query
    })
}

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
