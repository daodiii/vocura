import type { EPJAdapter, PatientContext, EPJNote, EPJPushResult } from './types';

export class ManualExportAdapter implements EPJAdapter {
  readonly adapterType = 'manual-export' as const;

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    return { ok: true };
  }

  async searchPatients(_query: string): Promise<PatientContext[]> {
    return [];
  }

  async fetchPatientContext(id: string): Promise<PatientContext> {
    return { epjPatientId: id, displayName: id };
  }

  async pushNote(_note: EPJNote): Promise<EPJPushResult> {
    return {
      success: false,
      error: 'Ingen EPJ-tilkobling konfigurert. Bruk PDF-eksport eller kopier tekst.',
    };
  }

  async pushFormDocument(
    _formType: string,
    _formData: Record<string, unknown>,
    _patientId: string
  ): Promise<EPJPushResult> {
    return {
      success: false,
      error: 'Ingen EPJ-tilkobling konfigurert. Bruk PDF-eksport.',
    };
  }
}
