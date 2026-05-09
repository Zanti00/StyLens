"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Shirt,
  Camera,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Globe,
  Award,
} from "lucide-react";

const customEase = [0.21, 0.47, 0.32, 0.98] as const;

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: customEase },
} as const;

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.15,
    },
  },
  viewport: { once: true },
} as const;

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-200/60 shadow-sm text-indigo-600 font-bold text-sm"
              >
                <Sparkles size={16} />
                <span>AI-Powered Fashion Intelligence</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: customEase }}
                className="text-6xl md:text-8xl font-bold font-outfit text-slate-900 tracking-tight leading-[1.05]"
              >
                Elevate your <br />
                <span className="text-gradient">style daily.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="text-xl md:text-2xl text-slate-500 max-w-xl font-medium leading-relaxed"
              >
                StyLens uses advanced AI to analyze your outfits, considers local weather, and provides expert styling tips to ensure you look your best.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="flex flex-col sm:flex-row items-center gap-6 pt-4"
              >
                <a
                  href="/signup"
                  className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-bold text-lg rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group hover:-translate-y-1"
                >
                  Start Styling Now
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </a>
                <div className="flex -space-x-3 items-center">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                    </div>
                  ))}
                  <div className="pl-6 text-sm font-bold text-slate-500">
                    Joined by 10k+ stylists
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: customEase }}
              className="relative"
            >
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white">
                <img 
                  src="/images/landing/hero.png" 
                  alt="Style Hero" 
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                
                {/* Floating Analysis Card */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-10 left-10 right-10 glass p-6 rounded-3xl border-white/40 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analysis Status</p>
                        <p className="text-sm font-black text-slate-900">Style Match: 94%</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-tighter">Verified</div>
                  </div>
                  <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1.5, delay: 1 }}
                      className="h-full bg-indigo-500" 
                    />
                  </div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-60" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-100 rounded-full blur-[100px] opacity-60" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Analyses Done", val: "500k+", icon: <Zap size={20} className="text-indigo-500" /> },
              { label: "Global Users", val: "100k+", icon: <Users size={20} className="text-purple-500" /> },
              { label: "Trend Accuracy", val: "99.2%", icon: <Award size={20} className="text-emerald-500" /> },
              { label: "Regions Covered", val: "140+", icon: <Globe size={20} className="text-blue-500" /> },
            ].map((stat, i) => (
              <div key={i} className="space-y-2 group cursor-default">
                <div className="flex items-center justify-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  {stat.icon}
                  {stat.label}
                </div>
                <p className="text-4xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Experience Section */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <motion.div {...fadeInUp} className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-bold font-outfit text-slate-900 tracking-tight leading-[1.1]">
                  Understand every <br />
                  <span className="text-indigo-600">texture and tone.</span>
                </h2>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                  Our advanced vision model doesn't just see clothes — it understands fabrics, weights, and how they interact with your environment.
                </p>
              </div>

              <div className="space-y-8">
                {[
                  { title: "Fabric Recognition", desc: "Identify wool, silk, linen, and technical fabrics instantly." },
                  { title: "Weather Adaptivity", desc: "Styling advice that changes based on real-time temperature." },
                  { title: "Color Theory", desc: "Harmonious combinations based on sophisticated palettes." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <CheckCircle2 size={24} className="text-indigo-600 group-hover:text-white" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-slate-900">{item.title}</h4>
                      <p className="text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: customEase }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="space-y-6 pt-12">
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img src="/images/landing/textures.png" alt="Fashion Textures" className="w-full aspect-[3/4] object-cover" />
                </div>
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white -rotate-2 hover:rotate-0 transition-transform duration-500 bg-indigo-500 p-8 flex items-center justify-center aspect-square">
                  <Sparkles size={60} className="text-white opacity-40" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-square bg-slate-900 flex items-center justify-center p-8">
                  <Shirt size={60} className="text-white opacity-40" />
                </div>
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img src="/images/landing/group.png" alt="Style Group" className="w-full aspect-[3/4] object-cover" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-24">
          <motion.div {...fadeInUp} className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold font-outfit text-slate-900 tracking-tight">
              Powerful features, <br />
              <span className="text-indigo-600">expert results.</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium">Everything you need to master your wardrobe.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: <Camera size={32} />, title: "Vision AI", desc: "Industry-leading image recognition tailored for fashion items and silhouettes." },
              { icon: <Globe size={32} />, title: "Weather Context", desc: "Integrates with local forecasts to suggest breathable or insulating layers." },
              { icon: <Zap size={32} />, title: "Trend Sync", desc: "Regularly updated with global runway and street style trends." },
              { icon: <Star size={32} />, title: "Style Score", desc: "Get an objective rating based on fit, color harmony, and occasion suitability." },
              { icon: <Users size={32} />, title: "Personalized", desc: "Learns your preferences over time to suggest more of what you love." },
              { icon: <CheckCircle2 size={32} />, title: "Actionable", desc: "Not just critique — specific tips on what to change or add to perfect the look." },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeInUp} className="p-12 rounded-[3rem] bg-slate-50 hover:bg-indigo-50 transition-colors text-left space-y-6 group border border-transparent hover:border-indigo-100">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-bold text-slate-900">{f.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-40 pt-10">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[4rem] bg-slate-900 overflow-hidden p-20 md:p-32 text-center"
          >
            {/* Background Image with opacity */}
            <div className="absolute inset-0 opacity-20">
              <img src="/images/landing/group.png" alt="Background" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />

            <div className="relative z-10 space-y-12">
              <h2 className="text-5xl md:text-8xl font-bold font-outfit text-white tracking-tight leading-tight">
                Ready to redefine <br />
                <span className="text-indigo-400">your look?</span>
              </h2>
              <p className="text-slate-400 text-xl md:text-2xl max-w-2xl mx-auto font-medium">
                Join StyLens today and experience the future of personal styling. It's free to get started.
              </p>
              <div className="pt-6">
                <a
                  href="/signup"
                  className="inline-flex items-center gap-3 px-12 py-6 bg-white text-slate-900 font-black text-xl rounded-2xl hover:bg-indigo-50 transition-all shadow-2xl hover:-translate-y-1"
                >
                  Start Styling Now
                  <ArrowRight size={24} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
