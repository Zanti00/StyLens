"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500 glass-card p-12 max-w-md w-full">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
          <Mail size={40} />
        </div>
        <h2 className="text-3xl font-bold font-outfit text-gradient">
          Check your email
        </h2>
        <p className="text-slate-500 text-lg">
          We've sent a verification link to{" "}
          <span className="font-semibold text-slate-900">{email}</span>.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
        >
          Back to {mode}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 glass-card p-8 md:p-12">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-outfit tracking-tight text-gradient">
          {mode === "login" ? "Welcome back" : "Join StyLens"}
        </h1>
        <p className="text-slate-500 font-medium">
          {mode === "login"
            ? "Sign in to access your personal stylist"
            : "Start your journey to better style today"}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50/50 backdrop-blur-md border border-red-100 text-red-600 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <label className="text-sm font-semibold text-slate-700 ml-1 mb-1.5 block">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10"
                size={18}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="glass-input w-full pl-12"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-sm font-semibold text-slate-700 ml-1 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10"
                size={18}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input w-full pl-12"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group disabled:bg-slate-300 disabled:shadow-none"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              {mode === "login" ? "Sign In" : "Create Account"}
              <Sparkles size={18} />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm font-medium pt-2">
        <span className="text-slate-500">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
        </span>{" "}
        <a
          href={mode === "login" ? "/signup" : "/login"}
          className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </a>
      </div>
    </div>
  );
};
