// Prisma — يُنشأ كسولاً فقط في وضع قاعدة البيانات (الاستضافة الذاتية)
// في وضع SERVERLESS لا يُستخدم إطلاقاً (انظر src/lib/stateless.ts)
import type { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrisma(): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient: PC } = require('@prisma/client')
  return new PC({ log: ['error'] })
}

export const db: PrismaClient =
  process.env.SERVERLESS === '1'
    ? (null as unknown as PrismaClient) // غير مستخدم في وضع serverless
    : (globalForPrisma.prisma ?? createPrisma())

if (process.env.NODE_ENV !== 'production' && process.env.SERVERLESS !== '1') globalForPrisma.prisma = db as PrismaClient
