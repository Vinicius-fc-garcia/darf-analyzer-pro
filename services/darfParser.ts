import * as pdfjsLib from 'pdfjs-dist';
import { DarfResult, TARGET_CODES } from '../types';

// O truque para funcionar no Vite/Production:
// Verifica se a biblioteca está no 'default' ou na raiz
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Define o worker via CDN para evitar erros de caminho no GitHub Pages
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const parseCurrency = (valueStr: string): number => {
  if (!valueStr) return 0;
  // Remove tudo que não é número ou vírgula, troca vírgula por ponto
  const cleanStr = valueStr.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleanStr);
};

const extractTextByLines = async (pdf: any): Promise<string[]> => {
  const lines: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    // Ordena itens: Y (descendo), depois X (esquerda-direita)
    items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) < 4) { 
        return a.transform[4] - b.transform[4];
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
      
      if (currentY !== -1 && Math.abs(currentY - itemY) > 4) {
        if (currentLineText.trim()) lines.push(currentLineText.trim());
        currentLineText = "";
        lastItemX = -1;
        lastItemWidth = 0;
      }
      
      if (lastItemX !== -1) {
        const gap = itemX - (lastItemX + lastItemWidth);
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
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const lines = await extractTextByLines(pdf);
    const debugLines = [...lines];

    for (const line of lines) {
      const cleanLine = line.replace(/\s+/g, ' ').trim();

      for (const code of TARGET_CODES) {
        const codeStartRegex = new RegExp(`^\\s*${code}\\b`);
        
        if (codeStartRegex.test(cleanLine)) {
            const moneyMatches = cleanLine.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/g);
            
            if (moneyMatches && moneyMatches.length > 0) {
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
