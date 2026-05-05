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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// --- Sub-components ---

const HistoryImage: React.FC<{ src: string }> = ({ src }) => (
  <div className="relative w-full md:w-64 aspect-[4/5] md:aspect-square overflow-hidden flex-shrink-0">
    <img
      src={src}
      alt="Outfit"
      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
  </div>
);

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
        <button className="text-slate-300 hover:text-red-500 transition-colors ml-auto p-2">
          <Trash2 size={18} />
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

const HistoryCard: React.FC<{ item: any; index: number }> = ({
  item,
  index,
}) => (
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
    </Link>
  </motion.div>
);

const HistoryCardSkeleton = () => (
  <div className="glass-card w-full animate-pulse flex flex-col md:flex-row overflow-hidden">
    {/* Skeleton Image */}
    <div className="w-full md:w-64 aspect-[4/5] md:aspect-square bg-slate-100 flex-shrink-0" />

    {/* Skeleton Content */}
    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center min-w-0">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex gap-1.5">
          <div className="h-4 w-16 bg-slate-100 rounded-md" />
          <div className="h-4 w-16 bg-slate-100 rounded-md" />
        </div>
        <div className="h-3 w-24 bg-slate-100 rounded-md" />
      </div>
      <div className="h-8 w-3/4 bg-slate-100 rounded-lg mb-3" />
      <div className="space-y-2 mb-6">
        <div className="h-3.5 w-full bg-slate-100 rounded" />
        <div className="h-3.5 w-full bg-slate-100 rounded" />
        <div className="h-3.5 w-2/3 bg-slate-100 rounded" />
      </div>
      <div className="flex items-center gap-4 mt-auto md:mt-0">
        <div className="h-4 w-24 bg-slate-100 rounded" />
        <div className="h-8 w-8 bg-slate-50 rounded-full ml-auto" />
      </div>
    </div>

    {/* Skeleton Rating */}
    <div className="w-full md:w-48 p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/30">
      <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
      <div className="h-2 w-20 bg-slate-100 rounded mb-2" />
      <div className="h-10 w-16 bg-slate-100 rounded-lg" />
    </div>
  </div>
);

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

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await analysisApi.getHistory();
      setItems(response.data.items);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load history:", err);
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
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
      <AnimatePresence>
        {processedItems.map((item, index) => (
          <HistoryCard key={item.id} item={item} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
};
