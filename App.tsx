import React, { useState, useCallback } from 'react';
import FileUploader from './components/FileUploader';
import ResultsPreview from './components/ResultsPreview';
import { processFile } from './services/darfParser';
import { DarfResult } from './types';
import { LayoutDashboard, Loader2, Github, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [results, setResults] = useState<DarfResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setResults([]);
    setProgress({ current: 0, total: files.length });

    const batchSize = 10; 
    const allResults: DarfResult[] = [];

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (file) => {
        const fileResults = await processFile(file);
        return fileResults;
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(resArray => {
        allResults.push(...resArray);
      });

      setProgress({ current: Math.min(i + batchSize, files.length), total: files.length });
      setResults(prev => [...prev, ...batchResults.flat()]);
    }

    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-brand-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-900 text-white p-2.5 rounded-lg border border-white/10 ring-1 ring-white/10">
                <LayoutDashboard className="w-6 h-6 text-brand-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                DARF Analyzer 
                <span className="px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono uppercase tracking-widest">Pro</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
              </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 relative z-10">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-indigo-300 text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Processamento via OCR Inteligente</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Análise Contábil <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Automatizada</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
                Arraste seus PDFs para identificar automaticamente os códigos 
                <span className="font-mono text-brand-300 mx-1.5 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">5952</span>, 
                <span className="font-mono text-brand-300 mx-1.5 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">1162</span> e 
                <span className="font-mono text-brand-300 mx-1.5 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">1708</span>.
            </p>
        </div>

        {/* Upload Area */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <FileUploader 
              onFilesSelected={handleFilesSelected} 
              isProcessing={isProcessing} 
            />
            
            {/* Progress Indicator */}
            {isProcessing && (
              <div className="px-8 pb-8 pt-2 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between text-sm font-medium text-slate-300">
                  <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                      <span className="tracking-wide">PROCESSANDO ARQUIVOS...</span>
                  </span>
                  <span className="font-mono text-brand-400">{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-center text-slate-500 font-mono">
                  {progress.current} / {progress.total}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Results Area */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             <ResultsPreview results={results} />
        </section>

      </main>
    </div>
  );
};

export default App;