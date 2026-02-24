import type {
  EPJAdapter,
  PatientContext,
  EPJNote,
  EPJPushResult,
  LeyrCredentials,
} from './types';

const LEYR_BASE_URL = process.env.LEYR_BASE_URL || 'https://api.leyr.io';
const TIMEOUT_MS = 15_000;

export class LeyrAdapter implements EPJAdapter {
  readonly adapterType = 'leyr' as const;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(private credentials: LeyrCredentials) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry - 300_000) {
      return this.accessToken;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${LEYR_BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Leyr auth failed (${res.status}): ${body}`);
      }

      const data = await res.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
      return this.accessToken!;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    retry = true
  ): Promise<T> {
    const token = await this.getAccessToken();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${LEYR_BASE_URL}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Care-Unit-Id': this.credentials.careUnitId,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (res.status === 401 && retry) {
        this.accessToken = null;
        this.tokenExpiry = 0;
        return this.request<T>(method, path, body, false);
      }

      if (res.status >= 500 && retry) {
        await new Promise((r) => setTimeout(r, 2000));
        return this.request<T>(method, path, body, false);
      }

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Leyr API error (${res.status}): ${errBody}`);
      }

      return res.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.getAccessToken();
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Kunne ikke koble til EPJ-systemet',
      };
    }
  }

  async searchPatients(query: string): Promise<PatientContext[]> {
    try {
      const data = await this.request<{
        results: Array<{ id: string; name: string; birthYear?: number }>;
      }>('GET', `/patients?search=${encodeURIComponent(query)}`);

      return (data.results || []).map((p) => ({
        epjPatientId: p.id,
        displayName: p.name,
        birthYear: p.birthYear,
      }));
    } catch {
      return [];
    }
  }

  async fetchPatientContext(epjPatientId: string): Promise<PatientContext> {
    const data = await this.request<{
      id: string;
      name: string;
      birthYear?: number;
    }>('GET', `/patients/${encodeURIComponent(epjPatientId)}`);

    return {
      epjPatientId: data.id,
      displayName: data.name,
      birthYear: data.birthYear,
    };
  }

  async pushNote(note: EPJNote): Promise<EPJPushResult> {
    try {
      const data = await this.request<{ id: string; url?: string }>(
        'POST',
        '/medical-notes',
        {
          patientId: note.patientId,
          title: note.title,
          content: note.content,
          type: note.templateType || 'clinical-note',
          diagnosisCodes: note.diagnosisCodes,
          encounterType: note.encounterType,
          authorHprNumber: note.authorHprNumber,
          createdAt: note.createdAt,
        }
      );

      return {
        success: true,
        epjNoteId: data.id,
        epjUrl: data.url,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Kunne ikke sende notat til EPJ',
      };
    }
  }

  async pushFormDocument(
    formType: string,
    formData: Record<string, unknown>,
    patientId: string
  ): Promise<EPJPushResult> {
    const sections = Object.entries(formData)
      .filter(([, v]) => v !== '' && v !== null && v !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return this.pushNote({
      patientId,
      patientDisplayName: '',
      title: formType,
      content: sections,
      templateType: `form-${formType}`,
      createdAt: new Date().toISOString(),
    });
  }
}
