import React, { useMemo, useState } from 'react';
import { DarfResult } from '../types';
import { CheckCircle, AlertTriangle, XCircle, FileSpreadsheet, Eye, X, Calculator, Search } from 'lucide-react';
import { generateExcel } from '../services/excelGenerator';

interface ResultsPreviewProps {
  results: DarfResult[];
}

const ResultsPreview: React.FC<ResultsPreviewProps> = ({ results }) => {
  const [debugItem, setDebugItem] = useState<DarfResult | null>(null);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => 
      a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [results]);

  const totalValue = results.reduce((acc, curr) => acc + (curr.status === 'success' ? curr.value : 0), 0);
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status !== 'success').length;

  if (results.length === 0) return null;

  return (
    <div className="space-y-6">
      
      {/* Dashboard Summary Card */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Calculator className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Valor Total Apurado</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mt-1">
                    {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
            </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
             <div className="flex flex-col items-center px-4 border-r border-slate-800">
                <span className="text-slate-400 mb-1">Processados</span>
                <span className="font-bold text-white text-lg">{results.length}</span>
             </div>
             <div className="flex flex-col items-center px-4 border-r border-slate-800">
                <span className="text-emerald-400 mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Sucesso</span>
                <span className="font-bold text-white text-lg">{successCount}</span>
             </div>
             <div className="flex flex-col items-center px-4">
                <span className={`${errorCount > 0 ? 'text-rose-400' : 'text-slate-500'} mb-1 flex items-center gap-1`}><AlertTriangle className="w-3 h-3" /> Atenção</span>
                <span className="font-bold text-white text-lg">{errorCount}</span>
             </div>
        </div>

        <button
            onClick={() => generateExcel(results)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 border border-emerald-400/20"
        >
            <FileSpreadsheet className="w-5 h-5" />
            Exportar Excel
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-950/90 text-slate-400 font-semibold sticky top-0 z-10 backdrop-blur-md shadow-sm border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wide">ARQUIVO</th>
                <th className="px-6 py-4 font-medium tracking-wide">CÓDIGO</th>
                <th className="px-6 py-4 font-medium tracking-wide text-right">VALOR</th>
                <th className="px-6 py-4 font-medium tracking-wide">STATUS</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {sortedResults.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-200 border-l-2 border-transparent hover:border-brand-500 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[250px] sm:max-w-md">{row.filename}</span>
                      </div>
                  </td>
                  <td className="px-6 py-4">
                      <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded text-xs font-mono font-medium">
                          {row.code}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-200 tracking-tight text-base">
                      {row.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4">
                    {row.status === 'success' && (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Aprovado
                      </span>
                    )}
                    {row.status === 'warning' && (
                      <span className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-medium cursor-help" title={row.message}>
                        <AlertTriangle className="w-3.5 h-3.5" /> Verificar
                      </span>
                    )}
                    {row.status === 'error' && (
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-medium cursor-help" title={row.message}>
                          <XCircle className="w-3.5 h-3.5" /> Erro
                        </span>
                        <span className="text-[10px] text-rose-300/70">{row.message}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                      {row.status !== 'success' && row.debugText && (
                          <button 
                              onClick={() => setDebugItem(row)}
                              className="text-slate-500 hover:text-brand-400 hover:bg-slate-800 p-2 rounded-lg transition-all"
                              title="Inspecionar Leitura"
                          >
                              <Search className="w-4 h-4" />
                          </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debug Modal */}
      {debugItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                             <Eye className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Inspeção de Leitura</h3>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{debugItem.filename}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setDebugItem(null)}
                        className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 overflow-auto flex-1 bg-slate-950/50 font-mono text-xs text-slate-300 scrollbar-thin scrollbar-thumb-slate-700">
                    <div className="space-y-6">
                        <div className="bg-slate-900 p-4 rounded-xl border border-rose-500/20 shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                            <h4 className="font-bold text-rose-400 mb-2 text-sm uppercase tracking-wide">Diagnóstico do Erro</h4>
                            <p className="text-slate-200 text-sm mb-3">{debugItem.message}</p>
                            
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Linha Bruta Identificada:</p>
                            <div className="bg-black/30 p-3 rounded border border-slate-800 break-all text-amber-200/90 font-medium">
                                {debugItem.rawLine || '(Nenhuma linha correspondente)'}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-400 mb-3 uppercase text-xs tracking-wider border-b border-slate-800 pb-2">Extração Completa do PDF</h4>
                            <div className="space-y-1">
                                {debugItem.debugText?.map((line, idx) => (
                                    <div key={idx} className="flex gap-4 hover:bg-slate-800/50 p-1 rounded transition-colors group">
                                        <span className="text-slate-600 w-8 text-right select-none text-[10px] pt-0.5 group-hover:text-slate-400">{idx + 1}</span>
                                        <span className="text-slate-400 whitespace-pre-wrap break-all group-hover:text-slate-200">{line}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-800 bg-slate-900 rounded-b-2xl flex justify-end">
                    <button 
                        onClick={() => setDebugItem(null)}
                        className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
                    >
                        Fechar Inspeção
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPreview;