"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Palette,
  Ruler,
  Lightbulb,
  Maximize2,
  X,
  ArrowLeft,
  Calendar,
  RotateCcw,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analysisApi } from "@/lib/api";
import Link from "next/link";

interface AnalysisDetailProps {
  id: string;
}

export const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ id }) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const swapWithMain = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[0], newImages[index]] = [newImages[index], newImages[0]];
    setImages(newImages);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id || id === "undefined") {
        setError("Invalid analysis ID provided.");
        setLoading(false);
        return;
      }
      try {
        const response = await analysisApi.getDetail(id);
        setResult(response.data);
        // Handle multiple images if present, fallback to single image_url
        const urls = response.data.image_urls || (response.data.image_url ? [response.data.image_url] : []);
        setImages(urls);
      } catch (err: any) {
        console.error("Failed to fetch analysis detail:", err);
        setError(err.message || "Failed to load analysis details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading analysis details...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
          <X size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 font-outfit">Error Loading Analysis</h3>
        <p className="text-slate-500 mt-3">{error || "The analysis could not be found."}</p>
        <Link
          href="/history"
          className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
        >
          <ArrowLeft size={18} /> Back to History
        </Link>
      </div>
    );
  }

  const categories = Array.isArray(result.style_preference)
    ? result.style_preference
    : result.style_preference && result.style_preference !== "Versatile"
      ? [result.style_preference]
      : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header / Navigation */}
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <Link
          href="/history"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="hidden md:inline">Back to History</span>
        </Link>
        <div className="flex items-center gap-3 text-slate-400">
          <Calendar size={18} />
          <span className="font-bold text-sm uppercase tracking-widest">
            {new Date(result.created_at).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col md:flex-row gap-8 items-start"
      >
        {/* Left Side: Image Preview */}
        <div className="w-full md:w-2/5 md:sticky md:top-24">
          <div
            className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-2xl group/preview cursor-zoom-in"
            onClick={() => setIsMaximized(true)}
          >
            <img
              src={images[0]}
              alt="Outfit Analysis"
              className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
            />

            {/* Style Categories Tags Overlay */}
            {categories.length > 0 && (
              <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 z-10">
                {categories.map((cat: string, i: number) => (
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

          {/* Auxiliary Images Gallery (Detail View) */}
          {images.length > 1 && (
            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              {images.slice(1).map((src, index) => (
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
                  {result.rating || "0"}
                </span>
                <span className="text-2xl font-bold text-slate-400">/10</span>
              </div>
            </div>
            <p className="text-slate-600 font-medium max-w-sm">
              {result.overall_summary || "No summary available."}
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
                <h4 className="font-bold text-slate-800">Color Analysis</h4>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(result.color_analysis?.hex_codes || ["#cbd5e1", "#94a3b8"]).map(
                    (color: string) => (
                      <div
                        key={color}
                        className="w-8 h-8 rounded-full border border-slate-200"
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {result.color_analysis?.verdict || "No color verdict available."}
                </p>
              </div>
            </div>

            {/* Fit & Proportions */}
            <div className="glass rounded-[2rem] p-6 border border-white/40 shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <Ruler size={20} />
                </div>
                <h4 className="font-bold text-slate-800">Fit & Proportions</h4>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {result.fit_proportion_analysis || "No fit analysis available."}
                </p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(result.rating || 7) * 10}%` }}
                  />
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
              <h4 className="font-bold text-slate-800">Style Notes & Tips</h4>
            </div>
            <ul className="space-y-3">
              {(result.style_notes_tips || ["No tips available."]).map(
                (tip: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                    {tip}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Maximized Modal */}
      <AnimatePresence>
        {isMaximized && images.length > 0 && (
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
                src={images[0]}
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
