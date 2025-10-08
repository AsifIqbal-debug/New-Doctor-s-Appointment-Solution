import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Database connection helper to handle hibernation
async function connectWithRetry(prismaClient: PrismaClient, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await prismaClient.$connect()
      return
    } catch (error) {
      console.log(`Database connection attempt ${i + 1} failed:`, error)
      if (i === retries - 1) throw error
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

// Handle serverless database wake-up
export async function ensureConnection() {
  try {
    // Ping the database to wake it up if hibernating
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.log('Database connection lost, reconnecting...')
    try {
      await prisma.$disconnect()
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (retryError) {
      console.error('Failed to reconnect to database:', retryError)
      return false
    }
  }
}