// src/lib/lab-reference-ranges.ts
// Norwegian NOKLUS-based reference ranges for common lab panels.
// Units are the standard Norwegian lab report units.

export interface ReferenceRange {
  low?: number;
  high?: number;
  unit: string;
  description: string; // Norwegian display name
}

export const LAB_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // Hematology
  hb: { low: 11.7, high: 17.5, unit: 'g/dL', description: 'Hemoglobin' },
  hgb: { low: 11.7, high: 17.5, unit: 'g/dL', description: 'Hemoglobin' },
  hematokrit: { low: 0.35, high: 0.52, unit: 'L/L', description: 'Hematokrit' },
  erytrocytter: { low: 3.8, high: 6.0, unit: '10⁶/μL', description: 'Erytrocytter' },
  leukocytter: { low: 3.5, high: 10.0, unit: '10⁹/L', description: 'Leukocytter' },
  nøytrofile: { low: 1.8, high: 7.5, unit: '10⁹/L', description: 'Nøytrofile granulocytter' },
  lymfocytter: { low: 1.0, high: 4.5, unit: '10⁹/L', description: 'Lymfocytter' },
  monocytter: { low: 0.2, high: 1.0, unit: '10⁹/L', description: 'Monocytter' },
  eosinofile: { low: 0.0, high: 0.5, unit: '10⁹/L', description: 'Eosinofile granulocytter' },
  trombocytter: { low: 145, high: 390, unit: '10⁹/L', description: 'Trombocytter' },
  mcv: { low: 80, high: 100, unit: 'fL', description: 'MCV (midlere erytrocyttvolum)' },
  mch: { low: 27, high: 33, unit: 'pg', description: 'MCH' },

  // Inflammatory markers
  crp: { low: 0, high: 5, unit: 'mg/L', description: 'CRP' },
  sr: { low: 0, high: 20, unit: 'mm/t', description: 'Senkningsreaksjon (SR)' },
  prokalsitonin: { low: 0, high: 0.1, unit: 'ng/mL', description: 'Prokalsitonin' },

  // Kidney
  kreatinin: { low: 45, high: 105, unit: 'μmol/L', description: 'Kreatinin' },
  egfr: { low: 60, high: 999, unit: 'mL/min/1.73m²', description: 'eGFR' },
  urea: { low: 3.0, high: 8.5, unit: 'mmol/L', description: 'Urea' },
  urinstoff: { low: 3.0, high: 8.5, unit: 'mmol/L', description: 'Urinstoff' },

  // Electrolytes
  natrium: { low: 137, high: 145, unit: 'mmol/L', description: 'Natrium' },
  na: { low: 137, high: 145, unit: 'mmol/L', description: 'Natrium' },
  kalium: { low: 3.5, high: 5.0, unit: 'mmol/L', description: 'Kalium' },
  k: { low: 3.5, high: 5.0, unit: 'mmol/L', description: 'Kalium' },
  klorid: { low: 98, high: 107, unit: 'mmol/L', description: 'Klorid' },
  kalsium: { low: 2.15, high: 2.55, unit: 'mmol/L', description: 'Kalsium' },
  magnesium: { low: 0.7, high: 1.1, unit: 'mmol/L', description: 'Magnesium' },
  fosfat: { low: 0.8, high: 1.5, unit: 'mmol/L', description: 'Fosfat' },

  // Liver
  alat: { low: 5, high: 45, unit: 'U/L', description: 'ALAT' },
  asat: { low: 5, high: 40, unit: 'U/L', description: 'ASAT' },
  alkalisk_fosfatase: { low: 35, high: 105, unit: 'U/L', description: 'Alkalisk fosfatase (ALP)' },
  alp: { low: 35, high: 105, unit: 'U/L', description: 'Alkalisk fosfatase (ALP)' },
  ggt: { low: 0, high: 60, unit: 'U/L', description: 'Gamma-GT (GGT)' },
  bilirubin: { low: 5, high: 25, unit: 'μmol/L', description: 'Bilirubin (total)' },
  albumin: { low: 36, high: 48, unit: 'g/L', description: 'Albumin' },
  inr: { low: 0.8, high: 1.2, unit: '', description: 'INR' },

  // Thyroid
  tsh: { low: 0.4, high: 4.0, unit: 'mIE/L', description: 'TSH' },
  ft4: { low: 9.0, high: 22.0, unit: 'pmol/L', description: 'Fritt T4' },
  ft3: { low: 3.5, high: 6.5, unit: 'pmol/L', description: 'Fritt T3' },

  // Glucose / Diabetes
  glukose: { low: 3.9, high: 6.1, unit: 'mmol/L', description: 'Glukose (fastende)' },
  hba1c: { low: 20, high: 48, unit: 'mmol/mol', description: 'HbA1c' },

  // Lipids
  totalkolesterol: { low: 0, high: 5.0, unit: 'mmol/L', description: 'Totalkolesterol' },
  ldl: { low: 0, high: 3.0, unit: 'mmol/L', description: 'LDL-kolesterol' },
  hdl: { low: 1.0, high: 99, unit: 'mmol/L', description: 'HDL-kolesterol' },
  triglyserider: { low: 0, high: 2.0, unit: 'mmol/L', description: 'Triglyserider' },

  // Iron
  ferritin: { low: 10, high: 300, unit: 'μg/L', description: 'Ferritin' },
  jern: { low: 9, high: 34, unit: 'μmol/L', description: 'S-Jern' },
  transferrin_metning: { low: 20, high: 50, unit: '%', description: 'Transferrinmetning' },
  tibc: { low: 45, high: 80, unit: 'μmol/L', description: 'TIBC' },

  // Vitamins
  b12: { low: 140, high: 700, unit: 'pmol/L', description: 'Vitamin B12' },
  folat: { low: 7, high: 45, unit: 'nmol/L', description: 'Folat' },
  d_vitamin: { low: 50, high: 200, unit: 'nmol/L', description: 'Vitamin D (25-OH)' },

  // Cardiac
  troponin_t: { low: 0, high: 14, unit: 'ng/L', description: 'Troponin T (hsTnT)' },
  bnp: { low: 0, high: 100, unit: 'pg/mL', description: 'BNP' },
  nt_probnp: { low: 0, high: 125, unit: 'pg/mL', description: 'NT-proBNP' },

  // Coagulation
  aptt: { low: 25, high: 38, unit: 'sek', description: 'APTT' },
  pt: { low: 70, high: 130, unit: '%', description: 'PT (protrombintid)' },
  d_dimer: { low: 0, high: 0.5, unit: 'mg/L FEU', description: 'D-dimer' },

  // Urine
  albumin_kreatinin: { low: 0, high: 3.0, unit: 'mg/mmol', description: 'Albumin/kreatinin-ratio (urin)' },
};

// Aliases for common abbreviations used in Norwegian lab reports
export const LAB_ALIASES: Record<string, string> = {
  'hgb': 'hb',
  'wbc': 'leukocytter',
  'rbc': 'erytrocytter',
  'plt': 'trombocytter',
  'na': 'natrium',
  'k': 'kalium',
  'cr': 'kreatinin',
  'crea': 'kreatinin',
  'alt': 'alat',
  'ast': 'asat',
  'alp': 'alkalisk_fosfatase',
  'bili': 'bilirubin',
  'chol': 'totalkolesterol',
  'trig': 'triglyserider',
  'glu': 'glukose',
  'gluc': 'glukose',
  'fe': 'jern',
  'vit_d': 'd_vitamin',
  '25-oh': 'd_vitamin',
  'tnt': 'troponin_t',
};

export function lookupRange(name: string): ReferenceRange | undefined {
  const key = name.toLowerCase().replace(/[\s\-\.]/g, '_');
  const aliasKey = LAB_ALIASES[key];
  return LAB_REFERENCE_RANGES[aliasKey ?? key];
}

export type LabStatus = 'normal' | 'borderline_low' | 'borderline_high' | 'low' | 'high' | 'unknown';

export function classifyValue(value: number, range: ReferenceRange): LabStatus {
  const BORDERLINE_MARGIN = 0.10; // 10%
  if (range.low !== undefined && value < range.low) {
    const borderlineThreshold = range.low * (1 - BORDERLINE_MARGIN);
    return value < borderlineThreshold ? 'low' : 'borderline_low';
  }
  if (range.high !== undefined && value > range.high) {
    const borderlineThreshold = range.high * (1 + BORDERLINE_MARGIN);
    return value > borderlineThreshold ? 'high' : 'borderline_high';
  }
  return 'normal';
}
