import * as pdfjsLib from 'pdfjs-dist';
import { DarfResult, TARGET_CODES } from '../types';

// Fix for ESM import behavior with pdfjs-dist on some CDNs/environments
// We check if the library is in the .default property or the root object
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Explicitly set the worker source to the stable version pinned in index.html
// This avoids version mismatches and 404s
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const parseCurrency = (valueStr: string): number => {
  if (!valueStr) return 0;
  // Remove non-numeric chars except comma
  const cleanStr = valueStr.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleanStr);
};

const extractTextByLines = async (pdf: pdfjsLib.PDFDocumentProxy): Promise<string[]> => {
  const lines: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    // 1. Sort items: Top-down (Y), then Left-right (X)
    items.sort((a, b) => {
      // transform[5] is Y. PDF Y is bottom-up usually, so larger Y is higher up.
      const yDiff = b.transform[5] - a.transform[5];
      
      // Threshold for "same line"
      if (Math.abs(yDiff) < 4) { 
        return a.transform[4] - b.transform[4]; // Sort by X
      }
      return yDiff;
    });

    let currentY = -1;
    let currentLineText = "";
    let lastItemX = -1;
    let lastItemWidth = 0;

    items.forEach((item) => {
      const itemY = item.transform[5];
      const itemX = item.transform[4];
      
      // Check for new line
      if (currentY !== -1 && Math.abs(currentY - itemY) > 4) {
        if (currentLineText.trim()) lines.push(currentLineText.trim());
        currentLineText = "";
        lastItemX = -1;
        lastItemWidth = 0;
      }
      
      // Determine spacing
      // If previous item exists on this line
      if (lastItemX !== -1) {
        // Calculate gap between end of last item and start of this item
        const gap = itemX - (lastItemX + lastItemWidth);
        
        // If gap is significant (> 4 or 5 units), add a space. 
        // Otherwise assume it's part of the same word (PDFs often split words into chars).
        // 4.0 is a safe heuristic for most standard fonts.
        if (gap > 4) {
          currentLineText += " ";
        }
      }

      currentLineText += item.str;
      
      currentY = itemY;
      lastItemX = itemX;
      lastItemWidth = item.width || 0;
    });
    
    if (currentLineText.trim()) lines.push(currentLineText.trim());
  }
  
  return lines;
};

export const processFile = async (file: File): Promise<DarfResult[]> => {
  const results: DarfResult[] = [];
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    // Use the 'pdfjs' constant which handles the import logic
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Extracted lines with improved spacing logic
    const lines = await extractTextByLines(pdf);
    const debugLines = [...lines]; // Copy for debug info

    for (const line of lines) {
      // Clean up extra spaces for regex matching
      const cleanLine = line.replace(/\s+/g, ' ').trim();

      for (const code of TARGET_CODES) {
        // Allow optional whitespace at start
        // Structure: Code (Start of line) -> Desc -> ... -> Value
        const codeStartRegex = new RegExp(`^\\s*${code}\\b`);
        
        if (codeStartRegex.test(cleanLine)) {
            // Find ALL monetary patterns
            // Format: 1.000,00 or 100,00 or 100,00(glued)
            // Regex: look for digits, optional dots, comma, 2 digits.
            // We use a capture group to ensure we get the full number string.
            const moneyMatches = cleanLine.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/g);
            
            if (moneyMatches && moneyMatches.length > 0) {
               // Use the LAST match as the Total value
               const valueStr = moneyMatches[moneyMatches.length - 1];
               const value = parseCurrency(valueStr);
               
               results.push({
                 id: `${file.name}-${code}-${results.length}`,
                 filename: file.name,
                 code: code,
                 value: value,
                 rawLine: cleanLine,
                 status: 'success',
                 debugText: debugLines
               });
            } else {
               results.push({
                 id: `${file.name}-${code}-warning-${results.length}`,
                 filename: file.name,
                 code: code,
                 value: 0,
                 rawLine: cleanLine,
                 status: 'warning',
                 message: 'Valor não identificado na linha.',
                 debugText: debugLines
               });
            }
        }
      }
    }

    if (results.length === 0) {
        return [{
            id: `${file.name}-error`,
            filename: file.name,
            code: 'N/A',
            value: 0,
            rawLine: '',
            status: 'error',
            message: 'Códigos não encontrados.',
            debugText: debugLines
        }];
    }

    return results;

  } catch (error: any) {
    console.error("Error parsing PDF", error);
    return [{
        id: `${file.name}-fatal`,
        filename: file.name,
        code: 'ERROR',
        value: 0,
        rawLine: '',
        status: 'error',
        message: `Erro fatal: ${error.message || 'Desconhecido'}`,
        debugText: []
    }];
  }
};