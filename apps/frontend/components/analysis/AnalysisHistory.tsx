'use client';

import React, { useEffect, useState } from 'react';
import { analysisApi } from '@/lib/api';
import { Calendar, Star, Trash2, ExternalLink, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    : (preference && preference !== "Versatile" ? [preference] : []);

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center min-w-0">
      <div className="flex flex-col gap-3 mb-4">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((tag, i) => (
              <span key={i} className="text-[0.7rem] px-2 py-0.5 bg-indigo-50 text-indigo-500 font-bold uppercase tracking-wider rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 truncate font-outfit">
        {title}
      </h3>
      <p className="text-slate-500 leading-relaxed line-clamp-3 text-sm md:text-base">
        {analysis || 'No analysis description provided for this item.'}
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

const HistoryCard: React.FC<{ item: any; index: number }> = ({ item, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="glass-card group flex flex-col md:flex-row overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500"
  >
    <HistoryImage src={item.image_url} />
    <HistoryContent 
      title="Style Analysis" 
      analysis={item.overall_summary} 
      date={item.created_at}
      preference={item.style_preference}
    />
    <HistoryRating score={item.rating || '0.0'} />
  </motion.div>
);

// --- Main Component ---

export const AnalysisHistory: React.FC = () => {
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
      console.error('Failed to load history:', err);
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card h-64 md:h-52 animate-pulse flex flex-col md:flex-row overflow-hidden">
             <div className="w-full md:w-52 h-full bg-slate-100" />
             <div className="flex-1 p-6 space-y-4">
                <div className="h-4 bg-slate-100 w-1/4 rounded" />
                <div className="h-8 bg-slate-100 w-3/4 rounded" />
                <div className="space-y-2">
                   <div className="h-3 bg-slate-100 w-full rounded" />
                   <div className="h-3 bg-slate-100 w-5/6 rounded" />
                </div>
             </div>
             <div className="w-full md:w-40 h-full bg-slate-50/50" />
          </div>
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
        <h3 className="text-2xl font-bold text-slate-900 font-outfit">Unable to load history</h3>
        <p className="text-slate-500 mt-3 max-w-xs mx-auto">
          {error === 'Unauthorized' ? 'Please log in to view your style history.' : error}
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
        <h3 className="text-2xl font-bold text-slate-900 font-outfit">No style history yet</h3>
        <p className="text-slate-500 mt-3 max-w-xs mx-auto">Upload your first outfit and start building your fashion journey today.</p>
        <a href="/" className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-indigo-500/10">
          Start Analysis
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto px-4 md:px-0 pb-12">
      <AnimatePresence>
        {items.map((item, index) => (
          <HistoryCard key={item.id} item={item} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
};
