export interface DarfResult {
  id: string;
  filename: string;
  code: string;
  value: number; // Stored as number for sorting/formatting, displayed as currency
  rawLine: string; // For debugging context
  status: 'success' | 'warning' | 'error';
  message?: string;
  debugText?: string[]; // Array of strings representing the parsed lines for debugging
}

export interface ProcessingStats {
  total: number;
  processed: number;
  success: number;
  errors: number;
}

export enum TaxCode {
  CSLL_PIS_COFINS = '5952',
  IRRF_PJ = '1162',
  IRRF_1708 = '1708'
}

export const TARGET_CODES = [TaxCode.CSLL_PIS_COFINS, TaxCode.IRRF_PJ, TaxCode.IRRF_1708];