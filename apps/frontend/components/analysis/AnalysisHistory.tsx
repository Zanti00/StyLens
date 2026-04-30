'use client';

import React, { useEffect, useState } from 'react';
import { analysisApi } from '@/lib/api';
import { Calendar, Cloud, Star, Trash2, ExternalLink } from 'lucide-react';

export const AnalysisHistory: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await analysisApi.getHistory();
      setItems(response.data.items);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 glass-card">
        <div className="w-16 h-16 glass text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No history yet</h3>
        <p className="text-slate-500 mt-2">Your analyzed outfits will appear here.</p>
        <a href="/" className="inline-block mt-6 text-indigo-600 font-bold hover:underline">Start your first analysis</a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item) => (
        <div key={item.id} className="group glass-card overflow-hidden transition-all duration-500">
          {/* Image Container */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <img 
              src={item.image_url} 
              alt="Outfit" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
               <button className="w-full glass text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                 <ExternalLink size={18} />
                 View Details
               </button>
            </div>
            {item.rating && (
              <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold text-slate-900">{item.rating}/10</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md">
                {item.style_preference}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            {item.weather_context && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Cloud size={14} />
                <span className="truncate">{item.weather_context.condition || item.weather_context}</span>
              </div>
            )}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
               <p className="text-sm text-slate-400 italic truncate pr-4">
                 {item.overall_summary || 'Analysis pending...'}
               </p>
               <button className="text-slate-300 hover:text-red-500 transition-colors p-1">
                 <Trash2 size={18} />
               </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
