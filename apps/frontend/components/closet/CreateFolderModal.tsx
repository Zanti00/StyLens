"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Tag, ChevronDown } from "lucide-react";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { MultiSelect } from "@/components/ui/MultiSelect";

const STYLE_OPTIONS = [
  "Casual", "Smart Casual", "Athleisure", "Minimalist", "Formal / Black Tie",
  "Business Professional", "Business Casual", "Semi-Formal", "Streetwear", "Urban",
  "Skater", "Hip-Hop", "Vintage", "Retro", "Y2K", "Classic / Old Money",
  "Traditional / Cultural", "Ethnic Fusion", "Festival Wear", "Goth", "Punk",
  "Grunge", "Emo", "Soft Girl / Soft Boy", "Dark Academia", "Light Academia",
  "Cottagecore", "Clean Girl / Clean Boy", "E-Girl / E-Boy", "Summer Wear",
  "Winter Wear", "Rainy / Waterproof", "Outdoor / Utility", "Luxury / Designer",
  "Avant-Garde", "Preppy", "Bohemian (Boho)", "Sporty", "Techwear", "Androgynous",
  "K-Fashion", "Harajuku", "Scandinavian", "Normcore"
];

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    aesthetic: string[];
    imageItems: { file?: File; preview: string }[];
  }) => Promise<void>;
  initialData?: {
    title: string;
    description: string;
    aesthetic: string[];
    images: string[];
  };
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [aesthetics, setAesthetics] = React.useState<string[]>([]);
  const [imageFiles, setImageFiles] = React.useState<{ file?: File; preview: string }[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isEdit = !!initialData;

  // Sync state with initialData when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      setAesthetics(initialData?.aesthetic || []);
      setImageFiles(
        initialData?.images.map((img) => ({ preview: img })) || []
      );
      lockScroll();
    }

    return () => {
      if (isOpen) {
        unlockScroll();
      }
    };
  }, [isOpen, initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      if (imageFiles.length >= 5) return;

      const file = e.target.files[0];
      
      // 2MB check
      if (file.size >= 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const preview = URL.createObjectURL(file);
      setImageFiles((prev) => [...prev, { file, preview }]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setError(null);
    const img = imageFiles[index];
    if (img.preview.startsWith("blob:")) {
      URL.revokeObjectURL(img.preview);
    }
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    // Cleanup object URLs
    imageFiles.forEach((img) => {
      if (img.preview.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setTitle("");
    setDescription("");
    setAesthetics([]);
    setImageFiles([]);
    setError(null);
    setIsSaving(false);
    onClose();
  };

  const handleSave = async () => {
    if (!title || imageFiles.length === 0 || aesthetics.length === 0) return;
    
    setIsSaving(true);
    try {
      await onSave({ title, description, aesthetic: aesthetics, imageItems: imageFiles });
      handleReset();
    } catch (error) {
      console.error("Failed to save folder:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-slate-950/40 backdrop-blur-md"
          onClick={handleReset}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col border border-white/20 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">
                  {isEdit ? "Edit Style Folder" : "Create New Folder"}
                </h2>
                <p className="text-slate-500 font-medium">
                  {isEdit
                    ? "Update your collection details and images."
                    : "Add images and details for your new collection."}
                </p>
              </div>

              {/* Multi-Image Upload Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Upload Images ({imageFiles.length}/5) <span className="text-red-500">*</span>
                  </h4>
                  {imageFiles.length < 5 && !error && (
                    <span className="text-xs font-bold text-indigo-500">
                      Min. 1 image required
                    </span>
                  )}
                  {error && (
                    <span className="text-xs font-bold text-red-500 animate-pulse">
                      {error}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      onClick={() => !imageFiles[i] && fileInputRef.current?.click()}
                      className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden ${
                        imageFiles[i]
                          ? "border-transparent bg-slate-100"
                          : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer"
                      }`}
                    >
                      {imageFiles[i] ? (
                        <>
                          <img
                            src={imageFiles[i].preview}
                            alt="Upload"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(i);
                            }}
                            disabled={isSaving}
                            className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload size={18} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Folder Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Winter Essentials"
                    className="glass-input w-full py-3 px-5 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the aesthetic of this folder..."
                    rows={2}
                    className="glass-input w-full py-3 px-5 text-base resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Tag size={12} className="text-indigo-400" />
                      Style Aesthetic <span className="text-red-500">*</span>
                    </label>
                    {aesthetics.length === 0 && (
                      <span className="text-[10px] font-bold text-indigo-500">
                        At least 1 required
                      </span>
                    )}
                  </div>
                  <MultiSelect
                    options={STYLE_OPTIONS}
                    selected={aesthetics}
                    onChange={setAesthetics}
                    placeholder="Select style categories..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleReset}
                  disabled={isSaving}
                  className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !title || imageFiles.length === 0 || aesthetics.length === 0}
                  className="flex-[2] py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving
                    ? "Saving..."
                    : isEdit
                    ? "Update Style Folder"
                    : "Save Style Folder"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
