export interface PatientContext {
  epjPatientId: string;
  displayName: string;
  birthYear?: number;
  encounterId?: string;
}

export interface EPJNote {
  patientId: string;
  patientDisplayName: string;
  content: string;
  title: string;
  diagnosisCodes?: Array<{
    code: string;
    system: 'ICPC-2' | 'ICD-10';
    label: string;
  }>;
  encounterType?: string;
  authorHprNumber?: string;
  templateType?: string;
  createdAt: string;
}

export interface EPJPushResult {
  success: boolean;
  epjNoteId?: string;
  epjUrl?: string;
  error?: string;
}

export interface EPJAdapter {
  readonly adapterType: 'leyr' | 'manual-export';
  testConnection(): Promise<{ ok: boolean; error?: string }>;
  searchPatients(query: string): Promise<PatientContext[]>;
  fetchPatientContext(epjPatientId: string): Promise<PatientContext>;
  pushNote(note: EPJNote): Promise<EPJPushResult>;
  pushFormDocument(
    formType: string,
    formData: Record<string, unknown>,
    patientId: string
  ): Promise<EPJPushResult>;
}

export interface LeyrCredentials {
  clientId: string;
  clientSecret: string;
  careUnitId: string;
  epjSystem: 'dips' | 'eg-pasientsky' | 'pridok';
}
