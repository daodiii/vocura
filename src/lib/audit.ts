import { prisma } from './prisma';
import crypto from 'crypto';

interface AuditLogParams {
    userId: string;
    entityType: 'journal_entry' | 'form_submission' | 'patient' | 'recording';
    entityId: string;
    action: 'create' | 'update' | 'delete' | 'approve';
    changes?: Record<string, unknown>;
    content?: string;
    ipAddress?: string;
}

export function computeContentHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
    const { userId, entityType, entityId, action, changes, content, ipAddress } = params;

    try {
        await prisma.auditLog.create({
            data: {
                userId,
                entityType,
                entityId,
                action,
                changes: changes ? (changes as object) : undefined,
                contentHash: content ? computeContentHash(content) : null,
                ipAddress: ipAddress ?? null,
            },
        });
    } catch (error) {
        // Audit logging should never break the main operation
        console.error('Audit log failed:', error);
    }
}
