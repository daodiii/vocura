import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAuthEvent, AuthEventType, getFailedLoginCount } from '../auth-events'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    authEvent: {
      create: vi.fn().mockResolvedValue({ id: 'test-id' }),
      count: vi.fn().mockResolvedValue(0),
    },
  },
}))

describe('createAuthEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a login event with required fields', async () => {
    const { prisma } = await import('@/lib/prisma')

    await createAuthEvent({
      userId: 'user-123',
      eventType: AuthEventType.LOGIN,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    })

    expect(prisma.authEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-123',
        eventType: 'login',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        success: true,
      }),
    })
  })

  it('creates a failed login event', async () => {
    const { prisma } = await import('@/lib/prisma')

    await createAuthEvent({
      userId: null,
      eventType: AuthEventType.LOGIN_FAILED,
      ipAddress: '10.0.0.1',
      userAgent: 'curl/7.0',
      success: false,
      metadata: { reason: 'invalid_credentials' },
    })

    expect(prisma.authEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventType: 'login_failed',
        success: false,
      }),
    })
  })
})

describe('AuthEventType', () => {
  it('has all required event types', () => {
    expect(AuthEventType.LOGIN).toBe('login')
    expect(AuthEventType.LOGOUT).toBe('logout')
    expect(AuthEventType.LOGIN_FAILED).toBe('login_failed')
    expect(AuthEventType.SESSION_TIMEOUT).toBe('session_timeout')
    expect(AuthEventType.MFA_CHALLENGE).toBe('mfa_challenge')
    expect(AuthEventType.MFA_SUCCESS).toBe('mfa_success')
    expect(AuthEventType.MFA_FAILED).toBe('mfa_failed')
  })
})

describe('getFailedLoginCount', () => {
  it('queries for failed logins within time window', async () => {
    const { prisma } = await import('@/lib/prisma')

    await getFailedLoginCount('10.0.0.1', 15)

    expect(prisma.authEvent.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        ipAddress: '10.0.0.1',
        eventType: 'login_failed',
      }),
    })
  })
})
