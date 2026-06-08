"use client";

import React, { useEffect, useState } from "react";
import { analysisApi } from "@/lib/api";
import {
  Calendar,
  Star,
  Trash2,
  ExternalLink,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { HistoryCardSkeleton } from "./HistoryCardSkeleton";
import { ConfirmModal } from "../ui/ConfirmModal";

// --- Sub-components ---

const HistoryImage: React.FC<{ src: string }> = ({ src }) => {
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full md:w-64 aspect-[4/5] md:aspect-square overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center">
      {!src || error ? (
        <div className="flex flex-col items-center gap-2 text-slate-300">
          <div className="p-3 bg-slate-100 rounded-2xl">
            <Calendar size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {error ? "Load Error" : "No Image"}
          </span>
        </div>
      ) : (
        <>
          <img
            src={src}
            alt="Outfit"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            onError={() => setError(true)}
          />
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
        </>
      )}
    </div>
  );
};

const HistoryContent: React.FC<{
  title: string;
  analysis: string;
  date: string;
  preference: string | string[];
}> = ({ title, analysis, date, preference }) => {
  const categories = Array.isArray(preference)
    ? preference
    : preference && preference !== "Versatile"
      ? [preference]
      : [];

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center min-w-0">
      <div className="flex flex-col gap-3 mb-4">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((tag, i) => (
              <span
                key={i}
                className="text-[0.7rem] px-2 py-0.5 bg-indigo-50 text-indigo-500 font-bold uppercase tracking-wider rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {new Date(date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 truncate font-outfit">
        {title}
      </h3>
      <p className="text-slate-500 leading-relaxed line-clamp-3 text-sm md:text-base">
        {analysis || "No analysis description provided for this item."}
      </p>
      <div className="mt-6 flex items-center gap-4">
        <button className="text-sm font-bold text-slate-900 flex items-center gap-1.5 hover:gap-2.5 transition-all duration-300">
          View Details <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

const HistoryRating: React.FC<{ score: number | string }> = ({ score }) => (
  <div className="w-full md:w-48 p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/30">
    <div className="bg-slate-100/80 p-3.5 rounded-2xl mb-4 shadow-sm border border-white/50">
      <Star size={24} className="fill-slate-900 text-slate-900" />
    </div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 text-center">
      Style Score
    </span>
    <div className="flex items-baseline gap-0.5">
      <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter font-outfit">
        {score}
      </span>
      <span className="text-lg font-bold text-slate-300 tracking-tighter">
        /10
      </span>
    </div>
  </div>
);

const HistoryCard: React.FC<{
  item: any;
  index: number;
  onDelete: (id: string) => void;
  deletingId: string | null;
}> = ({ item, index, onDelete, deletingId }) => {
  const isDeleting = deletingId === item.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        href={`/history/${item.id}`}
        className="glass-card group flex flex-col md:flex-row overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500"
      >
        <HistoryImage src={item.image_url} />
        <HistoryContent
          title={item.title || "Style Analysis"}
          analysis={item.overall_summary}
          date={item.created_at}
          preference={item.style_preference}
        />
        <HistoryRating score={item.rating || "0.0"} />
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onDelete(item.id);
          }}
          disabled={isDeleting}
          title={isDeleting ? "Deleting..." : "Delete this analysis"}
          className={`text-slate-300 hover:text-red-500 transition-colors ml-auto p-2 ${
            isDeleting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Trash2 size={18} />
        </button>
      </Link>
    </motion.div>
  );
};

// --- Main Component ---

interface AnalysisHistoryProps {
  searchQuery?: string;
  sortBy?: "date" | "category" | "rating";
  sortOrder?: "asc" | "desc";
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  searchQuery = "",
  sortBy = "date",
  sortOrder = "desc",
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortOrder]);

  const loadHistory = async () => {
    try {
      const response = await analysisApi.getHistory(100);
      const items = response?.data?.items || [];
      setItems(Array.isArray(items) ? items : []);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load history:", err);
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (analysisId: string) => {
    setDeleteConfirmationId(analysisId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmationId) return;
    const analysisId = deleteConfirmationId;

    setDeletingId(analysisId);
    try {
      await analysisApi.deleteAnalysis(analysisId);
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== analysisId),
      );
      setError(null);
      setDeleteConfirmationId(null);
    } catch (err: any) {
      console.error("Failed to delete analysis:", err);
      setError(err.message || "Failed to delete analysis");
    } finally {
      setDeletingId(null);
    }
  };

  const processedItems = React.useMemo(() => {
    let result = [...items];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(query)) ||
          (Array.isArray(item.style_preference) &&
            item.style_preference.some((s: string) =>
              s.toLowerCase().includes(query),
            )) ||
          (typeof item.style_preference === "string" &&
            item.style_preference.toLowerCase().includes(query)),
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === "category") {
        const catA = Array.isArray(a.style_preference)
          ? a.style_preference[0] || ""
          : a.style_preference || "";
        const catB = Array.isArray(b.style_preference)
          ? b.style_preference[0] || ""
          : b.style_preference || "";
        comparison = catA.localeCompare(catB);
      } else if (sortBy === "rating") {
        comparison = (Number(a.rating) || 0) - (Number(b.rating) || 0);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [items, searchQuery, sortBy, sortOrder]);

  const totalPages = Math.ceil(processedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = processedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto px-4 md:px-0 pb-12">
        {[1, 2, 3].map((i) => (
          <HistoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 glass-card max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-red-500/10 shadow-lg">
          <Trash2 size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 font-outfit">
          Unable to load history
        </h3>
        <p className="text-slate-500 mt-3 max-w-xs mx-auto">
          {error === "Unauthorized"
            ? "Please log in to view your style history."
            : error}
        </p>
        <button
          onClick={loadHistory}
          className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 glass-card max-w-2xl mx-auto">
        <div className="w-20 h-20 glass text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-indigo-500/10 shadow-lg">
          <Calendar size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 font-outfit">
          No style history yet
        </h3>
        <p className="text-slate-500 mt-3 max-w-xs mx-auto">
          Upload your first outfit and start building your fashion journey
          today.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-indigo-500/10"
        >
          Start Analysis
        </a>
      </div>
    );
  }

  if (processedItems.length === 0 && searchQuery) {
    return (
      <div className="text-center py-24 glass-card max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Search size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 font-outfit">
          No matches found
        </h3>
        <p className="text-slate-500 mt-3 max-w-xs mx-auto">
          Try adjusting your search query to find what you're looking for.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto px-4 md:px-0 pb-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-8"
        >
          {paginatedItems.map((item, index) => (
            <HistoryCard
              key={item.id}
              item={item}
              index={index}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 py-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-1 bg-white border border-slate-100 p-1 rounded-2xl shadow-sm">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Only show first, last, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                      currentPage === page
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <span
                    key={page}
                    className="w-10 h-10 flex items-center justify-center text-slate-300"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmationId !== null}
        onClose={() => setDeleteConfirmationId(null)}
        onConfirm={confirmDelete}
        title="Delete Analysis"
        message="Delete this analysis permanently? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        isLoading={deletingId !== null}
      />
    </div>
  );
};
