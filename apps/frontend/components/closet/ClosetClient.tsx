"use client";

import React from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import Stack from "@/components/ui/Stack";

interface Folder {
  id: number;
  title: string;
  items: number;
  lastUpdated: string;
  image: string;
}

const folders: Folder[] = [
  {
    id: 1,
    title: "Summer Essentials",
    items: 12,
    lastUpdated: "2d ago",
    image: "/mock-closet/summer.png",
  },
  {
    id: 2,
    title: "Date Night",
    items: 8,
    lastUpdated: "1w ago",
    image: "/mock-closet/date.png",
  },
  {
    id: 3,
    title: "Office Chic",
    items: 15,
    lastUpdated: "3d ago",
    image: "/mock-closet/office.png",
  },
];

interface ClosetClientProps {
  initialUser: User | null;
}

export default function ClosetClient({ initialUser }: ClosetClientProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            My Style Folders
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Curated collections for every occasion.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 px-8 py-4 bg-white text-slate-600 font-bold rounded-[1.5rem] shadow-[0_15px_40px_-12px_rgba(79,70,229,0.15)] border border-white/50 hover:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.25)] transition-all group self-start md:self-center"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <Plus size={16} strokeWidth={3} className="text-slate-600" />
          </div>
          Create Folder
        </motion.button>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-20">
        {folders.map((folder, index) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -8 }}
            className="group"
          >
            <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-white/60 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full">
              {/* Stacked Image Container */}
              <div className="relative aspect-square mb-8 px-4 py-2">
                {/* Visual Stack Backgrounds */}
                <div className="absolute top-4 right-2 bottom-8 left-10 bg-slate-100/80 rounded-[2rem] transform rotate-6 scale-95 transition-transform duration-700 group-hover:rotate-12" />
                <div className="absolute top-2 right-6 bottom-4 left-6 bg-slate-50/60 rounded-[2rem] transform -rotate-3 scale-95 transition-transform duration-700 group-hover:-rotate-6" />

                {/* Main Card Image with Stack Component */}
                <div className="relative w-full h-full">
                  <Stack
                    randomRotation={true}
                    sensitivity={180}
                    sendToBackOnClick={true}
                    cards={[folder.image, folder.image, folder.image].map(
                      (src, i) => (
                        <div
                          key={i}
                          className="w-full h-full rounded-[2.2rem] overflow-hidden shadow-[0_15px_35px_-12px_rgba(0,0,0,0.15)] bg-white "
                        >
                          <img
                            src={src}
                            alt={`${folder.title}-card-${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                        </div>
                      ),
                    )}
                  />
                </div>
              </div>

              {/* Folder Details */}
              <div className="space-y-3 px-2">
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover: transition-colors">
                  {folder.title}
                </h3>
                <div className="flex flex-col text-slate-500 font-semibold leading-relaxed">
                  <span className="text-[0.95rem]">
                    Last updated {folder.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
