"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle2,
  Maximize2,
  Sparkles,
  Star,
  Palette,
  Ruler,
  Lightbulb,
  Save,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OutfitUploaderProps {
  onFileSelect: (file: File | null) => void;
}

export const OutfitUploader: React.FC<OutfitUploaderProps> = ({
  onFileSelect,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMaximized(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
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
    setIsMaximized(false);
    setShowAnalysis(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative group rounded-[2rem] transition-all duration-500 min-h-[360px] flex flex-col items-center justify-center p-8 ${
          isDragging
            ? "border-indigo-400 bg-indigo-50/30 backdrop-blur-md"
            : preview
              ? " bg-emerald-50/10 cursor-default"
              : "border-white/20 glass hover:border-indigo-300 hover:bg-white/80 cursor-pointer"
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
          <AnimatePresence mode="wait">
            {!showAnalysis ? (
              <motion.div
                key="uploader"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative w-full h-full flex flex-col items-center"
              >
                <div
                  className="relative w-full aspect-square max-h-[400px] rounded-3xl overflow-hidden shadow-2xl mb-6 cursor-zoom-in group/preview"
                  onClick={() => setIsMaximized(true)}
                >
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-700"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-slate-900/0 group-hover/preview:bg-slate-900/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/preview:opacity-100">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white shadow-2xl transform scale-90 group-hover/preview:scale-100 transition-all duration-300">
                      <Maximize2 size={24} />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="absolute top-4 right-4 p-2.5 bg-slate-900/80 backdrop-blur-md text-white rounded-2xl hover:bg-red-500 transition-all shadow-xl z-10"
                    title="Remove photo"
                  >
                    <X size={20} />
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAnalysis(true);
                  }}
                  className="flex items-center gap-2.5 bg-btn-primary hover:bg-btn-primary-hover text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 group"
                >
                  <Sparkles
                    size={22}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  <span>Generate Analysis</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full flex flex-col md:flex-row gap-8 items-start"
              >
                {/* Left Side: Image Preview */}
                <div className="w-full md:w-2/5 md:sticky md:top-8">
                  <div
                    className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 group/preview cursor-zoom-in"
                    onClick={() => setIsMaximized(true)}
                  >
                    <img
                      src={preview}
                      alt="Outfit Preview"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover/preview:bg-slate-900/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/preview:opacity-100">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white shadow-2xl transform scale-90 group-hover/preview:scale-100 transition-all duration-300">
                        <Maximize2 size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Analysis Grid */}
                <div className="w-full md:w-3/5 space-y-6">
                  {/* Row 1: Numeric Rating */}
                  <div className="glass rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-4 border border-white/40 shadow-xl relative overflow-hidden group/rating">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover/rating:bg-indigo-500/20 transition-colors" />
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-2">
                      <Star size={32} className="fill-indigo-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                        Style Score
                      </h4>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-6xl font-black font-outfit text-slate-900">
                          8.5
                        </span>
                        <span className="text-2xl font-bold text-slate-400">
                          /10
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 font-medium max-w-sm">
                      Your outfit shows a strong sense of modern minimalism with
                      a great balance of textures.
                    </p>
                  </div>

                  {/* Row 2: Color Analysis and Fit & Proportions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Color Analysis */}
                    <div className="glass rounded-[2rem] p-6 border border-white/40 shadow-lg space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                          <Palette size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800">
                          Color Analysis
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          {[
                            "#1e293b",
                            "#64748b",
                            "#cbd5e1",
                            "#f8fafc",
                            "#f43f5e",
                          ].map((color) => (
                            <div
                              key={color}
                              className="w-8 h-8 rounded-full border border-slate-200"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Excellent use of neutral tones with a subtle pop of
                          rose for visual interest.
                        </p>
                      </div>
                    </div>

                    {/* Fit & Proportions */}
                    <div className="glass rounded-[2rem] p-6 border border-white/40 shadow-lg space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                          <Ruler size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800">
                          Fit & Proportions
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600 leading-relaxed">
                          The silhouette is well-defined. The cropped jacket
                          perfectly complements the high-waisted trousers.
                        </p>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full w-[90%] bg-emerald-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Style Note & Tips */}
                  <div className="glass rounded-[2rem] p-6 border border-white/40 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <Lightbulb size={20} />
                      </div>
                      <h4 className="font-bold text-slate-800">
                        Style Notes & Tips
                      </h4>
                    </div>
                    <ul className="space-y-3">
                      {[
                        "Try adding a silver necklace to enhance the cool tones.",
                        "Roll up the sleeves slightly for a more relaxed, effortless vibe.",
                        "The footwear choice is solid, but white sneakers would make this more casual.",
                      ].map((tip, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm text-slate-600"
                        >
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Row 4: Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-95 group">
                      <Save
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                      />
                      <span>Save to Closet</span>
                    </button>
                    <button
                      onClick={() => setShowAnalysis(false)}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 group"
                    >
                      <RotateCcw
                        size={18}
                        className="group-hover:-rotate-45 transition-transform"
                      />
                      <span>Try Another</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="text-center flex flex-col items-center space-y-6">
            <div className="w-20 h-20 glass rounded-3xl text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500 group-hover:shadow-indigo-500/10">
              <Upload size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-outfit text-slate-800">
                Upload your outfit
              </h3>
              <p className="text-slate-500 max-w-xs font-medium">
                Drag and drop your photo here, or click to browse from your
                device.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest pt-2">
              <span className="flex items-center gap-1.5">
                <ImageIcon size={14} /> JPG, PNG, JPEG
              </span>
              <span>•</span>
              <span>Max 10MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Maximized Modal */}
      <AnimatePresence>
        {isMaximized && preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-slate-950/20 backdrop-blur-sm"
            onClick={() => setIsMaximized(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-6xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={preview}
                alt="Maximized Outfit Preview"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              />

              <div className="absolute top-0 right-0 md:-top-2 md:-right-2 flex gap-3">
                <button
                  onClick={() => setIsMaximized(false)}
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl transition-all border border-white/10 shadow-2xl group"
                >
                  <X
                    size={28}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
