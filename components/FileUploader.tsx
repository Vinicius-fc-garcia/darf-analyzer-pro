import React, { useRef, useState } from 'react';
import { Upload, FileText, CloudUpload } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file: File) => file.type === 'application/pdf'
      );
      if (droppedFiles.length > 0) {
        onFilesSelected(droppedFiles);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(
        (file: File) => file.type === 'application/pdf'
      );
      onFilesSelected(selectedFiles);
    }
  };

  return (
    <div
      className={`relative p-12 transition-all duration-300 ease-out text-center cursor-pointer rounded-2xl overflow-hidden
        ${isDragOver 
          ? 'bg-brand-500/5' 
          : 'hover:bg-slate-800/50'
        }
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      {/* Dashed Border Overlay */}
      <div className={`absolute inset-4 border-2 border-dashed rounded-xl transition-colors duration-300 pointer-events-none
        ${isDragOver ? 'border-brand-500 bg-brand-500/5' : 'border-slate-700/50 group-hover:border-slate-600'}
      `} />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        multiple
        accept=".pdf"
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        <div className={`
            p-5 rounded-2xl transition-all duration-300 shadow-xl
            ${isDragOver 
                ? 'bg-gradient-to-br from-brand-500 to-indigo-600 scale-110 shadow-brand-500/25' 
                : 'bg-slate-800 border border-slate-700 group-hover:border-slate-600 group-hover:bg-slate-750'
            }
        `}>
          {isDragOver ? (
              <CloudUpload className="w-12 h-12 text-white animate-bounce" />
          ) : (
              <Upload className="w-12 h-12 text-brand-400 group-hover:text-brand-300 transition-colors" />
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-xl font-semibold text-slate-200 group-hover:text-white transition-colors">
            Solte seus DARFs aqui
          </p>
          <p className="text-sm text-slate-400 group-hover:text-slate-300 max-w-sm mx-auto">
            Processamento em lote inteligente. Clique para selecionar ou arraste arquivos PDF.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-brand-300 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full font-medium tracking-wide">
          <FileText className="w-3.5 h-3.5" />
          SUPORTA LOTES DE 100+ ARQUIVOS
        </div>
      </div>
    </div>
  );
};

export default FileUploader;