"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { ConfirmModal } from "../ui/ConfirmModal";
import { Folder } from "./ClosetClient";

// Removed local Folder interface in favor of shared import

interface FolderDetailModalProps {
  folder: Folder | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
  onAnalyze?: (id: string) => void;
  isAnalyzing?: boolean;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number | ((prev: number) => number)) => void;
}

export const FolderDetailModal: React.FC<FolderDetailModalProps> = ({
  folder,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAnalyze,
  isAnalyzing = false,
  currentImageIndex,
  setCurrentImageIndex,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [expandedImage, setExpandedImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen || expandedImage) {
      lockScroll();
    }

    return () => {
      if (isOpen || expandedImage) {
        unlockScroll();
      }
    };
  }, [isOpen, expandedImage]);

  if (!folder) return null;

  // Reverse images to show latest first
  const displayImages = [...folder.images].reverse();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(folder.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete folder:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length,
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="folder-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/40 backdrop-blur-md"
            onClick={onClose}
          >
            <motion.div
              key="folder-detail-content"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-[3rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col md:flex-row border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button Top Right */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-[10] p-3 bg-white/80 backdrop-blur-md text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:scale-110 active:scale-95"
              >
                <X size={24} />
              </button>
              {/* Left Side: Carousel */}
              <div className="w-full md:w-3/5 bg-slate-50 p-8 flex flex-col items-center justify-between gap-6 border-r border-slate-100">
                <div
                  className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl group/main cursor-zoom-in"
                  onClick={() =>
                    setExpandedImage(displayImages[currentImageIndex])
                  }
                >
                  <img
                    src={displayImages[currentImageIndex]}
                    alt={folder.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover/main:scale-105"
                  />

                  {/* Maximize Icon Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/main:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30">
                      <Maximize2 size={32} />
                    </div>
                  </div>

                  {/* Carousel Controls */}
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover/main:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all border border-white/30"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all border border-white/30"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  {/* Image Counter Badge */}
                  <div className="absolute bottom-6 right-6 px-4 py-2 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold rounded-full">
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-3 overflow-x-auto pb-2 w-full custom-scrollbar">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative flex-shrink-0 w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        currentImageIndex === idx
                          ? "border-indigo-500 scale-105 shadow-lg"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: Details */}
              <div className="w-full md:w-2/5 p-12 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                      {folder.title}
                    </h2>
                    <div className="text-indigo-600 font-bold tracking-wide uppercase text-sm flex items-start gap-3">
                      <span>Updated {folder.lastUpdated}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <div className="flex flex-wrap gap-2">
                        {folder.aesthetic.map((tag, i) => (
                          <span
                            key={i}
                            className="text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Description
                    </h4>
                    <p className="text-slate-600 text-lg leading-relaxed font-medium">
                      {folder.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-12">
                  <button
                    onClick={onEdit}
                    className="w-full flex items-center justify-center gap-2.5 bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] group"
                  >
                    <Edit2
                      size={18}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    Edit Folder Details
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={() => onAnalyze?.(folder.id)}
                      disabled={isAnalyzing || isDeleting}
                      className="flex-1 flex items-center justify-center gap-2.5 border-2 border-slate-200 text-slate-900 font-bold py-5 rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      ) : (
                        <Sparkles size={18} className="text-indigo-500" />
                      )}
                      {isAnalyzing ? "Analyzing..." : "Analyze"}
                    </button>
                    <button
                      onClick={() => setShowConfirm(true)}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center gap-2.5 bg-red-50 text-red-500 font-bold py-5 rounded-2xl hover:bg-red-100 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Image Lightbox */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-xl p-4 md:p-12"
            onClick={() => setExpandedImage(null)}
          >
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedImage(null);
              }}
              className="absolute top-8 right-8 z-[210] p-4 text-white/70 hover:text-white transition-all hover:rotate-90 hover:scale-110 active:scale-95 duration-300"
            >
              <X size={48} strokeWidth={2.5} />
            </button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={expandedImage}
                alt="Expanded view"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Style Folder"
        message={`Are you sure you want to delete "${folder.title}"? This will permanently remove all images and details in this collection.`}
        confirmText="Delete Folder"
        type="danger"
        isLoading={isDeleting}
      />
    </>
  );
};
