'use client';

import React from 'react';
import { AnalysisHistory } from '@/components/analysis/AnalysisHistory';
import { Sparkles, History as HistoryIcon } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 text-zinc-600 text-sm font-bold tracking-wide uppercase">
            <HistoryIcon size={16} />
            <span>Style Archive</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-outfit text-zinc-900 tracking-tight">
            Analysis History
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl">
            Track your style evolution and revisit previous outfit recommendations.
          </p>
        </div>

        <a 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Sparkles size={18} />
          New Analysis
        </a>
      </div>

      <AnalysisHistory />
    </div>
  );
}
