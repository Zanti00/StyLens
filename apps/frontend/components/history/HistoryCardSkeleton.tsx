import React from "react";

export const HistoryCardSkeleton = () => (
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
