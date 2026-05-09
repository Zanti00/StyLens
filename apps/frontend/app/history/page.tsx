"use client";

import React from "react";
import { HistoryToolbar } from "@/components/history/HistoryToolbar";
import { AnalysisHistory } from "@/components/history/AnalysisHistory";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"date" | "category" | "rating">(
    "date",
  );
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [hasUserSorted, setHasUserSorted] = React.useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold font-outfit text-slate-900 tracking-tight">
            Analysis History
          </h1>
          <p className="text-lg text-slate-500 max-w-xl">
            Track your style evolution and revisit previous outfit
            recommendations.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <HistoryToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        hasUserSorted={hasUserSorted}
        setHasUserSorted={setHasUserSorted}
      />

      <AnalysisHistory
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </div>
  );
}
