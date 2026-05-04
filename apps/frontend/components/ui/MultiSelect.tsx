"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Search, ChevronDown, Tag } from "lucide-react";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  label,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    const isSelected = selected.includes(option);
    if (isSelected) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== option));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectAll = () => {
    onChange([...options]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-2">
          <Tag size={12} className="text-indigo-400" />
          {label}
        </label>
      )}

      {/* Select Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className={`glass-input min-h-[54px] w-full py-2 px-4 flex flex-wrap gap-2 items-center cursor-pointer transition-all duration-300 ${
          isOpen ? "bg-white border-indigo-400 shadow-sm" : "bg-white/50 hover:bg-white"
        }`}
      >
        <div className="flex flex-wrap gap-2 flex-1 items-center">
          <AnimatePresence mode="popLayout">
            {selected.length > 0 ? (
              selected.map((item) => (
                <motion.span
                  key={item}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  layout
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-full border border-indigo-100 group/chip"
                >
                  {item}
                  <button
                    onClick={(e) => removeOption(item, e)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </motion.span>
              ))
            ) : (
              <span className="text-slate-400 font-medium ml-1">{placeholder}</span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 ml-auto pl-2 border-l border-slate-100">
          {selected.length > 0 && (
            <button
              onClick={clearAll}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-all"
              title="Clear all"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform duration-300 ${
              isOpen ? "rotate-180 text-indigo-500" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[120] mt-3 w-full bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-slate-50 flex items-center gap-2">
              <Search size={16} className="text-slate-400" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300"
              />
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = selected.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleOption(option)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-600"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-indigo-500 border-indigo-500"
                              : "border-slate-200 group-hover:border-indigo-300"
                          }`}
                        >
                          {isSelected && (
                            <Check size={14} strokeWidth={4} className="text-white" />
                          )}
                        </div>
                        <span className="font-bold text-sm">{option}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm font-medium">
                  No categories found.
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={selectAll}
                className="text-xs font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
