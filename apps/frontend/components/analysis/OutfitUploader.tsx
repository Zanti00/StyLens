'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface OutfitUploaderProps {
  onFileSelect: (file: File | null) => void;
}

export const OutfitUploader: React.FC<OutfitUploaderProps> = ({ onFileSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative group cursor-pointer rounded-[2rem] border-2 border-dashed transition-all duration-500 min-h-[360px] flex flex-col items-center justify-center p-8 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-50/30 backdrop-blur-md'
            : preview
            ? 'border-emerald-400/50 bg-emerald-50/10'
            : 'border-slate-200/60 glass hover:border-indigo-300 hover:bg-white/80'
        }`}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onInputChange}
          accept="image/*"
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full h-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="relative w-full aspect-square max-h-[400px] rounded-3xl overflow-hidden shadow-2xl mb-6 border-4 border-white">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="absolute top-4 right-4 p-2.5 bg-slate-900/80 backdrop-blur-md text-white rounded-2xl hover:bg-red-500 transition-all shadow-xl"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2.5 text-emerald-600 font-bold bg-emerald-50/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm">
              <CheckCircle2 size={22} />
              <span>Outfit Selected</span>
            </div>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center space-y-6">
            <div className="w-20 h-20 glass rounded-3xl text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500 group-hover:shadow-indigo-500/10">
              <Upload size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-outfit text-slate-800">Upload your outfit</h3>
              <p className="text-slate-500 max-w-xs font-medium">
                Drag and drop your photo here, or click to browse from your device.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest pt-2">
              <span className="flex items-center gap-1.5"><ImageIcon size={14} /> JPG, PNG, WEBP</span>
              <span>•</span>
              <span>Max 10MB</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
