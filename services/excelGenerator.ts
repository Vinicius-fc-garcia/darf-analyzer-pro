import * as XLSX from 'xlsx';
import { DarfResult } from '../types';

export const generateExcel = (data: DarfResult[]) => {
  // Sort data: Column A (Filename) Ascending
  const sortedData = [...data].sort((a, b) => {
    return a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Map to Excel structure
  const rows = sortedData.map(item => ({
    'Nome do Arquivo': item.filename,
    'Código da Retenção': item.code,
    'Valor da Retenção': item.value, // Keep as number for Excel math
    'Status': item.status === 'success' ? 'OK' : item.message || 'Erro'
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Formatting (Widths)
  const wscols = [
    { wch: 40 }, // Filename
    { wch: 20 }, // Code
    { wch: 20 }, // Value
    { wch: 50 }, // Status/Message
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DARF Analysis");

  // Generate filename with timestamp
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Relatorio_DARFs_${date}.xlsx`);
};