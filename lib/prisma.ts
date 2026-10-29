import { PrismaClient } from '@prisma/client'

function getEnhancedDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) return undefined

  try {
    const parsed = new URL(url)
    // Supabase PgBouncer: increase connection limit & pool timeout to prevent P2024 connection pool timeouts during builds
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '10')
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '30')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

const prismaClientSingleton = () => {
  const url = getEnhancedDatabaseUrl()
  return new PrismaClient(
    url ? { datasources: { db: { url } } } : undefined
  )
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
