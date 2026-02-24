import { prisma } from '@/lib/prisma';
import { decryptCredentials } from './credentials';
import { LeyrAdapter } from './LeyrAdapter';
import { ManualExportAdapter } from './ManualExportAdapter';
import type { EPJAdapter } from './types';

// Each call creates a new adapter instance. Token caching only benefits
// multiple API calls within the same adapter instance (e.g., searchPatients then pushNote).
// This is acceptable for serverless/edge where cross-request state is unavailable.
export async function getEPJAdapter(userId: string): Promise<EPJAdapter> {
  const integration = await prisma.epjIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive) {
    return new ManualExportAdapter();
  }

  try {
    const credentials = decryptCredentials(integration.encryptedCredentials);
    return new LeyrAdapter(credentials);
  } catch {
    return new ManualExportAdapter();
  }
}
