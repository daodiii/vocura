import { NextRequest } from 'next/server'

export function createMockRequest(
  method: string = 'GET',
  url: string = 'http://localhost:3000',
  options: { headers?: Record<string, string>; body?: unknown } = {}
): NextRequest {
  const init: RequestInit = { method }
  if (options.headers) {
    init.headers = new Headers(options.headers)
  }
  if (options.body) {
    init.body = JSON.stringify(options.body)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new NextRequest(new URL(url), init as any)
}

export function mockPrismaClient() {
  return {
    authEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    consentLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  }
}
