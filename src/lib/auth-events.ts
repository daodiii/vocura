import { prisma } from '@/lib/prisma'

export enum AuthEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  SESSION_TIMEOUT = 'session_timeout',
  MFA_CHALLENGE = 'mfa_challenge',
  MFA_SUCCESS = 'mfa_success',
  MFA_FAILED = 'mfa_failed',
}

interface AuthEventParams {
  userId: string | null
  eventType: AuthEventType
  ipAddress: string | null
  userAgent: string | null
  success?: boolean
  metadata?: Record<string, unknown>
}

export async function createAuthEvent(params: AuthEventParams): Promise<void> {
  const { userId, eventType, ipAddress, userAgent, success = true, metadata } = params

  try {
    await prisma.authEvent.create({
      data: {
        userId,
        eventType,
        ipAddress,
        userAgent,
        success,
        metadata: metadata ?? undefined,
      },
    })
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Failed to write auth event to database',
      authEvent: { userId, eventType, ipAddress, success },
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }))
  }
}

export async function getFailedLoginCount(
  ipAddress: string,
  windowMinutes: number = 15
): Promise<number> {
  const since = new Date(Date.now() - windowMinutes * 60_000)

  return prisma.authEvent.count({
    where: {
      ipAddress,
      eventType: AuthEventType.LOGIN_FAILED,
      createdAt: { gte: since },
    },
  })
}
