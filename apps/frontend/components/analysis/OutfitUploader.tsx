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
import { closetService } from "@/services/closet.service";

interface OutfitUploaderProps {
  onFileSelect: (file: File | null) => void;
}

export const OutfitUploader: React.FC<OutfitUploaderProps> = ({
  onFileSelect,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [randomCategories, setRandomCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMaximized(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleFilesChange = (newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    // Filter and limit to 5 total images
    const remainingSlots = 5 - selectedFiles.length;
    if (remainingSlots <= 0) {
      alert("You can only upload up to 5 images.");
      return;
    }

    const filesToProcess = filesArray.slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (file.type.startsWith("image/")) {
        if (file.size > 2 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 2MB.`);
          return;
        }
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      
      const readers = validFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((results) => {
        setPreviews((prev) => [...prev, ...results]);
        // Set the first newly added image as active if none were selected before
        if (selectedFiles.length === 0) {
          setActiveIndex(0);
        }
      });

      onFileSelect(validFiles[0]); // For backward compatibility with prop
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesChange(e.target.files);
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
    if (e.dataTransfer.files) {
      handleFilesChange(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    
    // Adjust active index
    if (activeIndex >= newFiles.length && newFiles.length > 0) {
      setActiveIndex(newFiles.length - 1);
    } else if (newFiles.length === 0) {
      setActiveIndex(0);
      onFileSelect(null);
    }
  };

  const swapWithMain = (index: number) => {
    if (index === 0) return;
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    [newFiles[0], newFiles[index]] = [newFiles[index], newFiles[0]];
    [newPreviews[0], newPreviews[index]] = [newPreviews[index], newPreviews[0]];
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    setActiveIndex(0);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setActiveIndex(0);
    onFileSelect(null);
    setIsMaximized(false);
    setShowAnalysis(false);
    setResult(null);
    setRandomCategories([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerateAnalysis = async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      // For now, we'll send all selected files if the backend supports it, 
      // otherwise we might need to adjust this.
      // Add all selected files to the form data
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const { analysisApi } = await import("@/lib/api");
      const response = await analysisApi.upload(formData);

      if (response.success) {
        setResult(response.data);
        if (response.data.style_preference) {
          setRandomCategories(response.data.style_preference);
        }
        setShowAnalysis(true);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze outfit. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToCloset = async () => {
    if (selectedFiles.length === 0 || !result) return;

    setIsSaving(true);
    try {
      const now = new Date();
      const title = `Analysis ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      const description = result.overall_summary || "Saved from outfit analysis";
      const aesthetic = randomCategories;

      await closetService.createFolder(
        title,
        description,
        aesthetic,
        selectedFiles
      );
      setSaveSuccess(true);

      // Reset success after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save to closet:", error);
      alert("Failed to save to closet. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative group rounded-[2rem] transition-all duration-500 min-h-[360px] flex flex-col items-center justify-center p-8 ${
          isDragging
            ? "border-slate-900 bg-slate-50/30 backdrop-blur-md"
            : previews.length > 0
              ? " bg-emerald-50/10 cursor-default"
              : "border-white/20 glass hover:border-slate-900 hover:bg-white/80 cursor-pointer"
        }`}
        onClick={() => previews.length === 0 && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onInputChange}
          accept="image/*"
          multiple
          className="hidden"
        />

        {previews.length > 0 ? (
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
                    src={previews[0]}
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
                      removeFile(0);
                    }}
                    className="absolute top-4 right-4 p-2.5 bg-slate-900/80 backdrop-blur-md text-white rounded-2xl hover:bg-red-500 transition-all shadow-xl z-10"
                    title="Remove photo"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Thumbnail Gallery - Exactly 4 slots at the bottom */}
                <div className="flex flex-wrap gap-3 mb-8 justify-center">
                  {/* Existing secondary images (slots 2-5) */}
                  {previews.slice(1).map((src, index) => (
                    <div
                      key={index + 1}
                      className="relative w-16 h-16 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 border-transparent opacity-60 hover:opacity-100 group/thumbnail"
                      onClick={(e) => {
                        e.stopPropagation();
                        swapWithMain(index + 1);
                      }}
                    >
                      <img src={src} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index + 1);
                        }}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-slate-900/80 text-white rounded-lg hover:bg-red-500 transition-colors opacity-0 group-hover/thumbnail:opacity-100"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Empty slots (Add buttons) to fill the 4 slots */}
                  {Array.from({ length: 4 - (previews.length - 1) }).map((_, i) => (
                    <button
                      key={`add-${i}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all bg-white/50"
                    >
                      <Upload size={16} />
                      <span className="text-[10px] font-bold mt-1">Add</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateAnalysis();
                  }}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2.5 bg-btn-primary hover:bg-btn-primary-hover text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles
                        size={22}
                        className="group-hover:rotate-12 transition-transform"
                      />
                      <span>Generate Analysis</span>
                    </>
                  )}
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
                    className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-2xl group/preview cursor-zoom-in"
                    onClick={() => setIsMaximized(true)}
                  >
                    <img
                      src={previews[0]}
                      alt="Outfit Preview"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
                    />

                    {/* Style Categories Tags Overlay */}
                    {randomCategories.length > 0 && (
                      <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 z-10">
                        {randomCategories.map((cat, i) => (
                          <span
                            key={i}
                            className="text-[0.75rem] px-3 py-1 bg-indigo-50 backdrop-blur-md text-indigo-600 font-bold uppercase tracking-wider rounded-xl shadow-lg border border-white/20"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-slate-900/0 group-hover/preview:bg-slate-900/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/preview:opacity-100">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white shadow-2xl transform scale-90 group-hover/preview:scale-100 transition-all duration-300">
                        <Maximize2 size={24} />
                      </div>
                    </div>
                  </div>

                  {/* Auxiliary Images Gallery (Analysis View) */}
                  {previews.length > 1 && (
                    <div className="flex flex-wrap gap-3 mt-6 justify-center">
                      {previews.slice(1).map((src, index) => (
                        <div
                          key={index + 1}
                          className="relative w-16 h-16 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            swapWithMain(index + 1);
                          }}
                        >
                          <img
                            src={src}
                            alt={`Outfit auxiliary ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Analysis Grid */}
                <div className="w-full md:w-3/5 space-y-6">
                  {/* Row 1: Numeric Rating */}
                  <div className="glass rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-4 border border-white/40 shadow-xl relative overflow-hidden group/rating">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover/rating:bg-slate-900/20 transition-colors" />
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 mb-2">
                      <Star size={32} className="fill-slate-900" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                        Style Score
                      </h4>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-6xl font-black font-outfit text-slate-900">
                          {result?.rating || "0"}
                        </span>
                        <span className="text-2xl font-bold text-slate-400">
                          /10
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 font-medium max-w-sm">
                      {result?.overall_summary || "Analysis pending..."}
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
                          {(
                            result?.color_analysis?.hex_codes || [
                              "#cbd5e1",
                              "#94a3b8",
                            ]
                          ).map((color: string) => (
                            <div
                              key={color}
                              className="w-8 h-8 rounded-full border border-slate-200"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {result?.color_analysis?.verdict ||
                            "Color analysis pending..."}
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
                          {result?.fit_proportion_analysis ||
                            "Fit analysis pending..."}
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
                      {(result?.style_notes_tips || ["Awaiting tips..."]).map(
                        (tip: string, i: number) => (
                          <li
                            key={i}
                            className="flex gap-3 text-sm text-slate-600"
                          >
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                            {tip}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  {/* Row 4: Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={handleSaveToCloset}
                      disabled={isSaving || saveSuccess}
                      className={`flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all shadow-xl active:scale-95 group ${
                        saveSuccess
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                      }`}
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : saveSuccess ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Save
                          size={18}
                          className="group-hover:scale-110 transition-transform"
                        />
                      )}
                      <span>
                        {isSaving
                          ? "Saving..."
                          : saveSuccess
                            ? "Saved!"
                            : "Save to Closet"}
                      </span>
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
            <div className="w-20 h-20 glass rounded-3xl text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500 group-hover:shadow-slate-900/10">
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
              <span>Max 2MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Maximized Modal */}
      <AnimatePresence>
        {isMaximized && previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-slate-950/50 backdrop-blur-sm"
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
                src={previews[0]}
                alt="Maximized Outfit Preview"
                className="max-w-full max-h-full object-contain rounded-2xl "
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
