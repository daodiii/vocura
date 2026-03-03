import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: 'test-id' }),
    },
  },
}))

describe('audit read-access logging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a view event for clinical note access', async () => {
    const { createAuditLog } = await import('../audit')
    const { prisma } = await import('@/lib/prisma')

    await createAuditLog({
      userId: 'user-123',
      entityType: 'clinical_note',
      entityId: 'note-456',
      action: 'view',
      ipAddress: '127.0.0.1',
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'view',
        entityType: 'clinical_note',
        entityId: 'note-456',
        userId: 'user-123',
      }),
    })
  })

  it('does not treat view as a critical action (no re-throw on failure)', async () => {
    const { prisma } = await import('@/lib/prisma')
    const mockCreate = prisma.auditLog.create as ReturnType<typeof vi.fn>
    mockCreate.mockRejectedValueOnce(new Error('DB connection failed'))

    const { createAuditLog } = await import('../audit')

    // view is not critical — should not throw
    await expect(
      createAuditLog({
        userId: 'user-123',
        entityType: 'clinical_note',
        entityId: 'note-456',
        action: 'view',
        ipAddress: '127.0.0.1',
      })
    ).resolves.toBeUndefined()
  })

  it('includes ipAddress in the audit log data', async () => {
    const { createAuditLog } = await import('../audit')
    const { prisma } = await import('@/lib/prisma')

    await createAuditLog({
      userId: 'user-123',
      entityType: 'clinical_note',
      entityId: 'note-456',
      action: 'view',
      ipAddress: '192.168.1.1',
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ipAddress: '192.168.1.1',
      }),
    })
  })
})
