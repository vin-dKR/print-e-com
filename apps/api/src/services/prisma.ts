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
  max: isServerless ? 1 : 10, // More connections for local dev, limit for serverless
  idleTimeoutMillis: isServerless ? 30000 : 60000, // Longer timeout for local dev
  connectionTimeoutMillis: isServerless ? 2000 : 10000, // Longer timeout for local dev
  // Additional settings for better connection management
  allowExitOnIdle: false,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
})

const adapter = new PrismaPg(pool)

// Configure Prisma Client
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Connection health check function
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}

// Graceful shutdown for serverless environments
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
    await pool.end()
  })

  // Handle uncaught errors
  process.on('unhandledRejection', (error) => {
    if (error instanceof Error && error.message.includes('Connection')) {
      console.error('Database connection error:', error.message)
    }
  })
}

export { prisma }
