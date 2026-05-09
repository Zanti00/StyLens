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
  MessageSquareText,
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
  const [usageStats, setUsageStats] = useState<{ used: number; limit: number } | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch usage stats on mount
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const { analysisApi } = await import("@/lib/api");
        const res = await analysisApi.getUsageStats();
        if (res.success && res.data) {
          setUsageStats(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch usage stats", err);
      }
    };
    fetchUsage();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMaximized(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Handle pending images from closet
  useEffect(() => {
    const handlePendingImages = async () => {
      const pending = sessionStorage.getItem("pending_analysis_images");
      if (pending) {
        try {
          const urls = JSON.parse(pending);
          sessionStorage.removeItem("pending_analysis_images");

          const fetchImageAsFile = async (
            url: string,
            filename: string,
          ): Promise<File> => {
            const response = await fetch(url);
            const blob = await response.blob();
            return new File([blob], filename, { type: blob.type });
          };

          const filePromises = urls.map((url: string, i: number) =>
            fetchImageAsFile(url, `folder-image-${i}.jpg`),
          );

          const files = await Promise.all(filePromises);

          setSelectedFiles(files);
          setPreviews(urls);
          setActiveIndex(0);

          // Automatically trigger analysis for closet folders
          handleGenerateAnalysis(files);
        } catch (e) {
          console.error("Failed to load pending images:", e);
        }
      }
    };
    handlePendingImages();
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
    setSaveSuccess(false);
    setAdditionalInfo("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getLocation = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(`${position.coords.latitude},${position.coords.longitude}`),
        (error) => {
          console.warn("Geolocation failed or denied:", error);
          resolve(null);
        },
        { timeout: 10000 } // 10 second timeout
      );
    });
  };

  const handleGenerateAnalysis = async (filesToUse?: File[]) => {
    const files = filesToUse || selectedFiles;
    if (files.length === 0) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      // Add all selected files to the form data
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Prompt and get user location for weather context
      const location = await getLocation();
      if (location) {
        formData.append("weather_location", location);
      }

      if (additionalInfo.trim()) {
        formData.append("user_additional_info", additionalInfo.trim());
      }

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
    } catch (error) {
      console.error("Failed to save to closet:", error);
      alert("Failed to save to closet. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isNearLimit = usageStats ? usageStats.used >= usageStats.limit * 0.8 : false;

  return (
    <div className="w-full space-y-6">
      {isNearLimit && !showAnalysis && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl flex items-start gap-4 shadow-sm">
          <div className="mt-0.5">
            <Lightbulb className="text-amber-500" size={20} />
          </div>
          <div>
            <h4 className="font-bold">API Limit Warning</h4>
            <p className="text-sm mt-1">You have reached 80% of your daily limit ({usageStats?.used}/{usageStats?.limit} used). To conserve your quota, further analyses will use the generic fallback model.</p>
          </div>
        </div>
      )}

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
                className="relative w-full h-full flex flex-col lg:flex-row gap-10 items-start p-2"
              >
                {/* Left Column: Image Previews */}
                <div className="w-full lg:w-1/2 flex flex-col items-center">
                  <div
                    className="relative w-full aspect-[3/4] max-h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl mb-6 cursor-zoom-in group/preview"
                    onClick={() => setIsMaximized(true)}
                  >
                    <img
                      src={previews[0]}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
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
                      className="absolute top-6 right-6 p-2.5 bg-slate-900/80 backdrop-blur-md text-white rounded-2xl hover:bg-red-500 transition-all shadow-xl z-10"
                      title="Remove photo"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {/* Existing secondary images (slots 2-5) */}
                    {previews.slice(1).map((src, index) => (
                      <div
                        key={index + 1}
                        className="relative w-16 h-16 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 border-transparent opacity-60 hover:opacity-100 hover:scale-105 hover:border-slate-300 group/thumbnail"
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
                </div>

                {/* Right Column: Context Input & Actions */}
                <div className="w-full lg:w-1/2 flex flex-col h-full space-y-8 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-800">
                      <div className="p-2 bg-slate-900 text-white rounded-xl">
                        <MessageSquareText size={20} />
                      </div>
                      <h3 className="text-xl font-bold font-outfit">Additional Context</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Tell the AI more about this outfit. Where are you going? What's the occasion? Are there specific details you want feedback on?
                    </p>
                    <div className="relative group">
                      <textarea
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        placeholder="e.g., I'm wearing this to a summer wedding. I'm not sure if the tie matches the pocket square..."
                        className="w-full min-h-[180px] p-6 rounded-[1.5rem] bg-white border-2 border-slate-100 focus:border-slate-900 focus:ring-0 transition-all duration-300 text-slate-700 placeholder:text-slate-300 resize-none shadow-sm hover:shadow-md group-hover:border-slate-200"
                      />
                      <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        Optional
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateAnalysis();
                      }}
                      disabled={isAnalyzing}
                      className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold px-10 py-5 rounded-[1.5rem] shadow-2xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        <>
                          <Sparkles
                            size={22}
                            className="group-hover:rotate-12 transition-transform text-amber-400"
                          />
                          <span className="text-lg">Generate AI Analysis</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3 border border-slate-100">
                    <div className="mt-0.5 text-slate-400">
                      <Lightbulb size={16} />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Pro tip: Mentioning the event type and your personal style goals helps the AI provide much more relevant and specific styling advice.
                    </p>
                  </div>
                </div>
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
                <div className="w-full md:w-2/5 md:sticky md:top-24">
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

                  {/* Auxiliary Images Gallery (Analysis View) - Matched to AnalysisDetail */}
                  {previews.length > 1 && (
                    <div className="flex flex-wrap gap-3 mt-6 justify-center">
                      {previews.slice(1).map((src, index) => (
                        <div
                          key={index + 1}
                          className="relative w-16 h-16 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 border-transparent opacity-60 hover:opacity-100 hover:scale-105 hover:border-slate-300"
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
                  {/* Generic Analysis Badge */}
                  {result?.is_generic && (
                    <div className="bg-slate-800 text-white px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-3">
                        <Sparkles className="text-amber-400" size={18} />
                        <span className="font-bold text-sm">Generic Analysis Mode</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium px-2 bg-slate-900/50 rounded-lg py-1">API Limit Fallback</span>
                    </div>
                  )}

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
