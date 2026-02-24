import { z } from 'zod';

// --- Template ---
export const templateCreateSchema = z.object({
    name: z.string().min(1, 'Navn er påkrevd').max(200),
    profession: z.string().min(1, 'Profesjon er påkrevd').max(50),
    content: z.string().min(1, 'Innhold er påkrevd').max(100_000),
    category: z.string().max(50).optional().default('general'),
});

export const templateUpdateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    content: z.string().min(1).max(100_000).optional(),
    profession: z.string().max(50).optional(),
    category: z.string().max(50).optional(),
    isFavorite: z.boolean().optional(),
});

// --- AI Routes ---
export const suggestCodesSchema = z.object({
    text: z.string().min(1, 'Klinisk tekst er påkrevd').max(50_000),
    profession: z.string().max(50).optional(),
});

export const summarizeSchema = z.object({
    text: z.string().min(1, 'Tekst er påkrevd').max(50_000),
    language: z.enum(['bokmal', 'nynorsk', 'enkel'], {
        error: 'Ugyldig språkvalg. Bruk: bokmal, nynorsk, eller enkel',
    }),
    patientName: z.string().max(200).optional(),
});

export const structureNoteSchema = z.object({
    text: z.string().min(1, 'Diktert tekst er påkrevd').max(50_000),
    templateType: z.string().min(1, 'Maltype er påkrevd').max(100),
    profession: z.string().max(50).optional(),
    patientName: z.string().max(200).optional(),
    encounterType: z.string().max(50).optional(),
});

// --- Export ---
export const exportSchema = z.object({
    title: z.string().min(1, 'Tittel er påkrevd').max(500),
    content: z.string().min(1, 'Innhold er påkrevd').max(500_000),
    type: z.string().min(1, 'Type er påkrevd').max(100),
    metadata: z.record(z.string(), z.string()).optional(),
});

// --- Auth ---
export const createProfileSchema = z.object({
    userId: z.string().min(1),
    email: z.string().email(),
    name: z.string().min(1).max(200),
});

// --- User Profile ---
export const profileUpdateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    role: z.string().max(50).optional(),
    hprNumber: z.string().max(20).nullable().optional(),
    address: z.string().max(500).nullable().optional(),
});

// --- Lab ---
export const labInterpretSchema = z.object({
  rawText: z.string().min(1, 'Laboratorieverdier er påkrevd').max(10_000),
  mode: z.enum(['paste', 'fetch']).default('paste'),
});

// --- Felleskatalogen Chat ---
export const felleskatalovenChatSchema = z.object({
  message: z.string().min(1, 'Melding er påkrevd').max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000),
  })).max(20).optional().default([]),
});

// --- EPJ Integration ---
export const epjPushSchema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd').max(500),
  content: z.string().min(1, 'Innhold er påkrevd').max(500_000),
  patientId: z.string().min(1, 'Pasient-ID er påkrevd').max(200),
  patientDisplayName: z.string().max(200).optional().default(''),
  diagnosisCodes: z
    .array(
      z.object({
        code: z.string().max(20),
        system: z.enum(['ICPC-2', 'ICD-10']),
        label: z.string().max(200),
      })
    )
    .optional(),
  encounterType: z.string().max(50).optional(),
  templateType: z.string().max(100).optional(),
});

export const epjIntegrationSchema = z.object({
  epjSystem: z.enum(['dips', 'eg-pasientsky', 'pridok'], {
    error: 'Ugyldig EPJ-system. Bruk: dips, eg-pasientsky, eller pridok',
  }),
  clientId: z.string().min(1, 'Client ID er påkrevd').max(500),
  clientSecret: z.string().min(1, 'Client Secret er påkrevd').max(500),
  careUnitId: z.string().min(1, 'Care Unit ID er påkrevd').max(200),
});
