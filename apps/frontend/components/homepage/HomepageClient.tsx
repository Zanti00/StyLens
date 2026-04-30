"use client";

import React, { useState } from "react";
import { OutfitUploader } from "@/components/analysis/OutfitUploader";
import {
  AnalysisForm,
  StylePreference,
} from "@/components/analysis/AnalysisForm";
import { analysisApi } from "@/lib/api";
import { CheckCircle2 } from "lucide-react";

interface HomepageClientProps {
  initialUser: any;
}

export default function HomepageClient({ initialUser }: HomepageClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [style, setStyle] = useState<StylePreference>("CASUAL");
  const [weather, setWeather] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const displayName =
    initialUser?.user_metadata?.full_name?.split(" ")[0] ||
    initialUser?.email?.split("@")[0] ||
    "Stylist";

  const handleSubmit = async () => {
    if (!file) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("style_preference", style);
      if (weather) formData.append("user_weather_input", weather);
      if (location) formData.append("weather_location", location);

      const response = await analysisApi.upload(formData);
      setResult(response.data);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(
        "Failed to analyze outfit. Please check if your backend is running.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setWeather("");
    setLocation("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-20 space-y-4">
        <h1 className="text-4xl md:text-7xl font-bold font-outfit text-slate-900 tracking-tight">
          Good day, {displayName}
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Upload a photo of your outfit and get instant, expert feedback from
          your personal AI stylist.
        </p>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="col-span-2">
            <OutfitUploader onFileSelect={setFile} />
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="glass-card p-10 md:p-16 text-center space-y-10">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
              <CheckCircle2 size={56} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold font-outfit">
                Analysis Submitted!
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Your outfit has been recorded. AI rating and detailed feedback
                will appear here once the model is active.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-center pt-6">
              <button
                onClick={handleReset}
                className="w-full md:w-auto px-10 py-5 rounded-2xl bg-btn-primary text-white font-bold hover:bg-btn-primary-hover transition-all hover:-translate-y-1 shadow-2xl shadow-slate-200"
              >
                Analyze Another
              </button>
              <a
                href="/history"
                className="w-full md:w-auto px-10 py-5 rounded-2xl bg-btn-primary text-white font-bold hover:bg-btn-primary-hover transition-all shadow-2xl shadow-slate-200 hover:-translate-y-1"
              >
                View History
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 group">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Style Selected
              </h3>
              <div className="text-2xl font-bold text-slate-800">{style}</div>
            </div>
            <div className="glass-card p-8 group">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Weather Provided
              </h3>
              <div className="text-2xl font-bold text-slate-800">
                {weather || location || "Not provided"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
