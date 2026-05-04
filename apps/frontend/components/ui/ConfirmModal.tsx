"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info";
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  isLoading = false,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      lockScroll();
    }

    return () => {
      if (isOpen) {
        unlockScroll();
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl ${
                    type === "danger"
                      ? "bg-red-50 text-red-500"
                      : "bg-indigo-50 text-indigo-500"
                  }`}
                >
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
              </div>

              <p className="text-slate-500 font-medium leading-relaxed">
                {message}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-[1.5] py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 ${
                    type === "danger"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  {isLoading ? "Processing..." : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
