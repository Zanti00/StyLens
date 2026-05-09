"use client";

import React from "react";
import { motion } from "framer-motion";
import Stack from "@/components/ui/Stack";
import { Folder } from "@/lib/mappers/closet";

interface FolderGridProps {
  folders: Folder[];
  isLoading: boolean;
  searchQuery: string;
  onFolderClick: (folder: Folder) => void;
}

export const FolderGrid: React.FC<FolderGridProps> = ({
  folders,
  isLoading,
  searchQuery,
  onFolderClick,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-slate-100 rounded-[2.5rem] aspect-[4/5]"
          />
        ))}
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400 font-medium text-lg">
          {searchQuery
            ? `No results found for "${searchQuery}"`
            : "No folders yet. Start by creating one!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {folders.map((folder, index) => (
        <motion.div
          key={folder.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ y: -8 }}
          className="group cursor-pointer"
          onClick={() => onFolderClick(folder)}
        >
          <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-white/60 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full">
            {/* Stacked Image Container */}
            <div className="relative aspect-square mb-8 px-4 py-2">
              {/* Visual Stack Backgrounds */}
              {folder.images.length > 1 && (
                <>
                  <div className="absolute top-4 right-2 bottom-8 left-10 bg-slate-100/80 rounded-[2rem] transform rotate-6 scale-95 transition-transform duration-700 group-hover:rotate-12" />
                  <div className="absolute top-2 right-6 bottom-4 left-6 bg-slate-50/60 rounded-[2rem] transform -rotate-3 scale-95 transition-transform duration-700 group-hover:-rotate-6" />
                </>
              )}

              {/* Main Card Image with Stack Component */}
              <div className="relative w-full h-full">
                <Stack
                  randomRotation={true}
                  sensitivity={180}
                  sendToBackOnClick={true}
                  cards={folder.images.map((src, i) => (
                    <div
                      key={i}
                      className="w-full h-full rounded-[2.2rem] overflow-hidden shadow-[0_15px_35px_-12px_rgba(0,0,0,0.15)] bg-white"
                    >
                      <img
                        src={src}
                        alt={`${folder.title}-card-${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                    </div>
                  ))}
                />
              </div>
            </div>

            {/* Folder Details */}
            <div className="space-y-3 px-2">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover: transition-colors">
                {folder.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 leading-relaxed">
                {folder.aesthetic.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[0.8rem] px-2 py-0.5 bg-indigo-50 text-indigo-500 font-bold uppercase tracking-wider rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
