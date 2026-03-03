import { prisma } from './prisma';
import crypto from 'crypto';

interface AuditLogParams {
    userId: string;
    entityType: 'journal_entry' | 'form_submission' | 'patient' | 'recording' | 'epj_push' | 'patient_context_import' | 'epj_integration' | 'clinical_note' | 'retention_settings' | 'auto_delete';
    entityId: string;
    action: 'create' | 'update' | 'delete' | 'approve' | 'push' | 'search' | 'auto_delete' | 'encrypt' | 'decrypt' | 'view' | 'sign';
    changes?: Record<string, unknown>;
    content?: string;
    ipAddress?: string;
}

/**
 * Critical audit actions that should propagate errors rather than swallowing them.
 * If a 'delete' or 'approve' audit entry cannot be persisted, the caller should
 * know so it can decide whether to abort the operation — losing these records
 * could violate GDPR audit-trail requirements.
 */
const CRITICAL_ACTIONS: AuditLogParams['action'][] = ['delete', 'approve', 'push', 'auto_delete', 'sign'];

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
        // Fallback: emit a structured JSON log so external log aggregators
        // (e.g. Datadog, ELK, CloudWatch) can still capture the audit event
        // even when the primary database write fails.
        console.error(JSON.stringify({
            level: 'error',
            message: 'AUDIT_LOG_FAILURE',
            timestamp: new Date().toISOString(),
            audit: {
                userId,
                entityType,
                entityId,
                action,
                changes,
                contentHash: content ? computeContentHash(content) : null,
                ipAddress: ipAddress ?? null,
            },
            error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
        }));

        // For critical security events (delete, approve), re-throw so the
        // calling operation can abort rather than proceeding without an audit trail.
        if (CRITICAL_ACTIONS.includes(action)) {
            throw error;
        }
    }
}
