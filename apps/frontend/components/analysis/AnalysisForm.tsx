'use client';

import React from 'react';
import { Cloud, Sparkles, MapPin } from 'lucide-react';

interface AnalysisFormProps {
  weather: string;
  onWeatherChange: (weather: string) => void;
  location: string;
  onLocationChange: (location: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled: boolean;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  weather,
  onWeatherChange,
  location,
  onLocationChange,
  onSubmit,
  isSubmitting,
  disabled,
}) => {
  return (
    <div className="w-full space-y-10">
      {/* Weather Context */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 text-slate-800 font-bold mb-4">
          <div className="w-8 h-8 glass rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
            <Cloud size={18} />
          </div>
          <span className="text-xl font-outfit">Current Weather</span>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-600 ml-1">
              Describe the weather
            </label>
            <input
              type="text"
              value={weather}
              onChange={(e) => onWeatherChange(e.target.value)}
              placeholder="e.g. Sunny and warm"
              className="glass-input w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-600 ml-1">
              Location (Optional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="City or coordinates"
                className="glass-input w-full pl-12"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={disabled || isSubmitting}
        className={`w-full py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-500 flex items-center justify-center gap-3 ${
          disabled || isSubmitting
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
            : 'bg-btn-primary text-white hover:bg-btn-primary-hover shadow-slate-200 hover:-translate-y-1 active:scale-[0.98]'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Sparkles size={22} />
            <span>Get Expert Advice</span>
          </>
        )}
      </button>
    </div>
  );
};
