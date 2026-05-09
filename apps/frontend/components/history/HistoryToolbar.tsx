"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Calendar,
  SortAsc,
  SortDesc,
  Tag,
  Star,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface HistoryToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: "date" | "category" | "rating";
  setSortBy: (sortBy: "date" | "category" | "rating") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  hasUserSorted: boolean;
  setHasUserSorted: (hasSorted: boolean) => void;
}

export const HistoryToolbar: React.FC<HistoryToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  hasUserSorted,
  setHasUserSorted,
}) => {
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);

  // Click outside handler for sort dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSort = (newSortBy: "date" | "category" | "rating") => {
    if (hasUserSorted && sortBy === newSortBy) {
      setSortBy("date");
      setSortOrder("desc");
      setHasUserSorted(false);
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortBy === "date" ? "desc" : "asc");
      setHasUserSorted(true);
    }
    setIsSortOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row bg-white p-4 rounded-2xl items-center shadow-md justify-between gap-6 mb-12">
      {/* Search Input (Left Most) */}
      <div className="relative w-full md:w-96 group">
        <input
          type="text"
          placeholder="Search title or style..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input w-full pl-11 py-3.5"
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
          size={18}
        />
      </div>

      {/* Action Buttons (Right Side) */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative" ref={sortDropdownRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className={`flex items-center gap-2.5 px-5 py-3.5 bg-white text-slate-600 font-bold rounded-2xl border transition-all group ${
              isSortOpen
                ? "border-indigo-500 shadow-sm"
                : "border-white/50 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal
              size={18}
              className={`${isSortOpen ? "text-indigo-500" : "text-slate-400 group-hover:text-indigo-500"} transition-colors`}
            />
            <span>Sort</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${isSortOpen ? "rotate-180 text-indigo-500" : "text-slate-400"}`}
            />
          </button>

          {/* Sort Dropdown */}
          {isSortOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 overflow-hidden"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">
                  Sort by
                </p>

                {/* Date Sort */}
                <button
                  onClick={() => toggleSort("date")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    hasUserSorted && sortBy === "date"
                      ? "bg-indigo-50 text-indigo-600"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={18} />
                    <span className="font-bold">Date</span>
                  </div>
                  {hasUserSorted &&
                    sortBy === "date" &&
                    (sortOrder === "desc" ? (
                      <SortDesc size={16} />
                    ) : (
                      <SortAsc size={16} />
                    ))}
                </button>

                {/* Category Sort */}
                <button
                  onClick={() => toggleSort("category")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    hasUserSorted && sortBy === "category"
                      ? "bg-indigo-50 text-indigo-600"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Tag size={18} />
                    <span className="font-bold">Style</span>
                  </div>
                  {hasUserSorted &&
                    sortBy === "category" &&
                    (sortOrder === "desc" ? (
                      <SortDesc size={16} />
                    ) : (
                      <SortAsc size={16} />
                    ))}
                </button>

                {/* Rating Sort */}
                <button
                  onClick={() => toggleSort("rating")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    hasUserSorted && sortBy === "rating"
                      ? "bg-indigo-50 text-indigo-600"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Star size={18} />
                    <span className="font-bold">Score</span>
                  </div>
                  {hasUserSorted &&
                    sortBy === "rating" &&
                    (sortOrder === "desc" ? (
                      <SortDesc size={16} />
                    ) : (
                      <SortAsc size={16} />
                    ))}
                </button>
              </div>

              {/* Sort Order Toggle */}
              <div className="mt-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    setHasUserSorted(true);
                    setIsSortOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  {sortOrder === "desc" ? (
                    <SortDesc size={18} />
                  ) : (
                    <SortAsc size={18} />
                  )}
                  <span className="font-bold text-sm">
                    {sortOrder === "desc" ? "Descending" : "Ascending"}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <Link
          href="/"
          className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-7 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl border border-white/50 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group"
        >
          <Sparkles size={18} />
          New Analysis
        </Link>
      </div>
    </div>
  );
};
