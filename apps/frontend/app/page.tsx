'use client';

import React from 'react';
import { Sparkles, Shirt, Camera, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-mesh">
      {/* Hero Section */}
      <section className="relative pt-24 pb-36 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border-white/60 shadow-lg shadow-indigo-500/5 text-indigo-600 font-bold text-sm animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles size={16} />
            <span>AI-Powered Fashion Intelligence</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold font-outfit text-slate-900 tracking-tight leading-[1.05] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Elevate your style with <br />
            <span className="text-gradient">AI precision.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in duration-1000 delay-300">
            StyLens analyzes your outfits, considers the weather, and provides expert styling tips to ensure you look your best every single day.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8 animate-in fade-in duration-1000 delay-500">
            <a 
              href="/signup" 
              className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white font-bold text-lg rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-2 group hover:-translate-y-1"
            >
              Get Started Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="/login" 
              className="w-full md:w-auto px-12 py-5 glass text-slate-900 font-bold text-lg rounded-2xl border-white/80 hover:bg-white/90 transition-all flex items-center justify-center hover:-translate-y-1"
            >
              Sign In
            </a>
          </div>

          {/* Hero Image / Mockup */}
          <div className="relative mt-24 max-w-5xl mx-auto group animate-in fade-in zoom-in duration-1000 delay-700">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] blur-xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative glass rounded-[2.5rem] border-white/80 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
              <div className="text-center space-y-5">
                 <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                   <Camera size={40} className="text-slate-300" />
                 </div>
                 <p className="text-slate-400 font-bold font-outfit text-lg">Visualizing your personal AI Stylist...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold font-outfit text-slate-900 tracking-tight">How StyLens works</h2>
            <p className="text-xl text-slate-500 font-medium">Three simple steps to a superior wardrobe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                icon: <Camera className="text-indigo-600" size={32} />, 
                title: "Snap & Upload", 
                desc: "Take a photo of your outfit. Our vision AI identifies fabrics, cuts, and colors instantly." 
              },
              { 
                icon: <Zap className="text-purple-600" size={32} />, 
                title: "AI Analysis", 
                desc: "Gemini 1.5 Flash processes your look against current trends and your personal style preferences." 
              },
              { 
                icon: <CheckCircle2 className="text-emerald-600" size={32} />, 
                title: "Expert Tips", 
                desc: "Receive actionable advice on layering and color matching tailored to your local weather." 
              }
            ].map((feature, idx) => (
              <div key={idx} className="glass-card p-10 space-y-8 group">
                <div className="w-16 h-16 glass rounded-2xl shadow-sm flex items-center justify-center border-white/60 group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold font-outfit text-slate-900">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-lg font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="glass rounded-[4rem] p-16 md:p-24 text-center space-y-10 relative overflow-hidden shadow-2xl border-white/80">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-48 -mb-48" />
            
            <h2 className="text-5xl md:text-7xl font-bold font-outfit text-slate-900 tracking-tight leading-tight">
              Ready to redefine <br /> <span className="text-gradient">your style?</span>
            </h2>
            <p className="text-slate-500 text-xl md:text-2xl max-w-2xl mx-auto font-medium">
              Join thousands of fashion-forward individuals using AI to master their daily look.
            </p>
            <div className="pt-6">
              <a 
                href="/signup" 
                className="inline-flex items-center gap-3 px-12 py-6 bg-slate-900 text-white font-bold text-xl rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 hover:-translate-y-1"
              >
                Start Styling Now
                <ArrowRight size={24} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
