"use client";

import React from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Clock,
  Calendar,
  SortAsc,
  SortDesc,
  Tag,
  Type,
} from "lucide-react";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Stack from "@/components/ui/Stack";
import { FolderDetailModal } from "./FolderDetailModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { closetService, Folder as DBFolder } from "@/services/closet.service";
import { analysisApi } from "@/lib/api";

export interface Folder {
  id: string;
  title: string;
  items: number;
  lastUpdated: string;
  rawTimestamp: number;
  image: string;
  description: string;
  aesthetic: string[];
  images: string[];
}

// Mock data removed in favor of real database fetching

interface ClosetClientProps {
  initialUser: User | null;
}

export default function ClosetClient({ initialUser }: ClosetClientProps) {
  const [selectedFolder, setSelectedFolder] = React.useState<Folder | null>(
    null,
  );
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [folders, setFolders] = React.useState<Folder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"date" | "category" | "title">(
    "date",
  );
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [hasUserSorted, setHasUserSorted] = React.useState(false);
  const [isAnalyzingFolder, setIsAnalyzingFolder] = React.useState(false);
  const router = useRouter();

  const toggleSort = (newSortBy: "date" | "category" | "title") => {
    if (hasUserSorted && sortBy === newSortBy) {
      // Toggle off
      setSortBy("date");
      setSortOrder("desc");
      setHasUserSorted(false);
    } else {
      // Toggle on / change category
      setSortBy(newSortBy);
      setSortOrder(newSortBy === "date" ? "desc" : "asc");
      setHasUserSorted(true);
    }
    setIsSortOpen(false);
  };

  const sortDropdownRef = React.useRef<HTMLDivElement>(null);

  // Click outside handler for sort dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const processedFolders = React.useMemo(() => {
    let result = [...folders];

    // Filter by search
    if (searchQuery) {
      result = result.filter(
        (folder) =>
          folder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          folder.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          folder.aesthetic.some((a) =>
            a.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = a.rawTimestamp - b.rawTimestamp;
      } else if (sortBy === "category") {
        comparison = (a.aesthetic[0] || "").localeCompare(b.aesthetic[0] || "");
      } else if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [folders, searchQuery, sortBy, sortOrder]);

  // Helper to format DB folder to UI folder
  const mapDBFolderToUI = (dbFolder: DBFolder): Folder => ({
    id: dbFolder.id,
    title: dbFolder.title,
    description: dbFolder.description,
    aesthetic: (() => {
      let val: any = dbFolder.aesthetic;
      try {
        // If it's a string, try to parse it
        if (typeof val === "string" && val.startsWith("[")) {
          val = JSON.parse(val);
        }
        // If it's an array with one element that is a string starting with "[", parse that too
        if (
          Array.isArray(val) &&
          val.length === 1 &&
          typeof val[0] === "string" &&
          val[0].startsWith("[")
        ) {
          val = JSON.parse(val[0]);
        }
      } catch (e) {
        console.error("Failed to parse aesthetic:", e);
      }

      if (Array.isArray(val)) return val;
      return val ? [val] : [];
    })(),
    items: dbFolder.image_urls.length,
    lastUpdated: new Date(dbFolder.updated_at).toLocaleDateString(),
    rawTimestamp: new Date(dbFolder.updated_at).getTime(),
    image: dbFolder.image_urls[0],
    images: dbFolder.image_urls,
  });

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const data = await closetService.getFolders();
      setFolders(data.map(mapDBFolderToUI));
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFolders();
  }, []);

  const handleSaveFolder = async (data: {
    title: string;
    description: string;
    aesthetic: string[];
    imageItems: { file?: File; preview: string }[];
  }) => {
    try {
      const existingUrls = data.imageItems
        .filter((img) => !img.file)
        .map((img) => img.preview);
      const newFiles = data.imageItems
        .filter((img) => !!img.file)
        .map((img) => img.file as File);

      if (selectedFolder) {
        // Update existing folder
        const updatedFolder = await closetService.updateFolder(
          selectedFolder.id,
          {
            title: data.title,
            description: data.description,
            aesthetic: data.aesthetic,
            existingImageUrls: existingUrls,
            newImageFiles: newFiles,
          },
        );
        setFolders((prev) =>
          prev.map((f) =>
            f.id === selectedFolder.id ? mapDBFolderToUI(updatedFolder) : f,
          ),
        );
      } else {
        // Create new folder
        const newFolder = await closetService.createFolder(
          data.title,
          data.description,
          data.aesthetic,
          newFiles,
        );
        setFolders((prev) => [mapDBFolderToUI(newFolder), ...prev]);
      }
      setIsCreateModalOpen(false);
      setSelectedFolder(null); // Reset selection after save
    } catch (error) {
      console.error("Failed to save folder:", error);
      throw error;
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await closetService.deleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Failed to delete folder:", error);
      throw error;
    }
  };

  const handleAnalyzeFolder = async (id: string) => {
    const folder = folders.find((f) => f.id === id);
    if (!folder || folder.images.length === 0) return;

    try {
      // Store images in sessionStorage for the uploader to pick up on the homepage
      sessionStorage.setItem(
        "pending_analysis_images",
        JSON.stringify(folder.images),
      );
      router.push("/homepage");
    } catch (error) {
      console.error("Failed to prepare folder for analysis:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-44">
      {/* Page Header */}
      <div className="flex flex-col gap-10 mb-16">
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

        {/* Controls Container */}
        <div className="flex flex-col md:flex-row bg-white p-4 rounded-2xl items-center shadow-md justify-between gap-6">
          {/* Search Input (Left Most) */}
          <div className="relative w-full md:w-96 group">
            <input
              type="text"
              placeholder="Search your folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-11 py-3.5"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
              size={18}
            />
          </div>

          {/* Action Buttons (Right Side) */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={`flex items-center gap-2.5 px-5 py-3.5 bg-white text-slate-600 font-bold rounded-2xl border transition-all group ${
                  isSortOpen
                    ? "border-indigo-500 shadow-sm"
                    : "border-white/50 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal
                  size={18}
                  className={`${isSortOpen ? "text-indigo-500" : "text-slate-400 group-hover:text-indigo-500"} transition-colors`}
                />
                <span>Sort</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${isSortOpen ? "rotate-180 text-indigo-500" : "text-slate-400"}`}
                />
              </button>

              {/* Sort Dropdown */}
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 overflow-hidden"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">
                      Sort by
                    </p>

                    {/* Date Sort */}
                    <button
                      onClick={() => toggleSort("date")}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        hasUserSorted && sortBy === "date"
                          ? "bg-indigo-50 text-indigo-600"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={18} />
                        <span className="font-bold">Date</span>
                      </div>
                      {hasUserSorted &&
                        sortBy === "date" &&
                        (sortOrder === "desc" ? (
                          <SortDesc size={16} />
                        ) : (
                          <SortAsc size={16} />
                        ))}
                    </button>

                    {/* Category Sort */}
                    <button
                      onClick={() => toggleSort("category")}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        hasUserSorted && sortBy === "category"
                          ? "bg-indigo-50 text-indigo-600"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Tag size={18} />
                        <span className="font-bold">Category</span>
                      </div>
                      {hasUserSorted &&
                        sortBy === "category" &&
                        (sortOrder === "desc" ? (
                          <SortDesc size={16} />
                        ) : (
                          <SortAsc size={16} />
                        ))}
                    </button>

                    {/* Title Sort */}
                    <button
                      onClick={() => toggleSort("title")}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        hasUserSorted && sortBy === "title"
                          ? "bg-indigo-50 text-indigo-600"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Type size={18} />
                        <span className="font-bold">Title</span>
                      </div>
                      {hasUserSorted &&
                        sortBy === "title" &&
                        (sortOrder === "desc" ? (
                          <SortDesc size={16} />
                        ) : (
                          <SortAsc size={16} />
                        ))}
                    </button>
                  </div>

                  {/* Sort Order Toggle */}
                  <div className="mt-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        setHasUserSorted(true);
                        setIsSortOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
                    >
                      {sortOrder === "desc" ? (
                        <SortDesc size={18} />
                      ) : (
                        <SortAsc size={18} />
                      )}
                      <span className="font-bold text-sm">
                        {sortOrder === "desc" ? "Descending" : "Ascending"}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedFolder(null);
                setIsCreateModalOpen(true);
              }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-7 py-3.5 bg-btn-primary text-white font-bold rounded-2xl border border-white/50 hover:bg-slate-900 transition-all group"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Plus size={14} strokeWidth={3} className="text-slate-600" />
              </div>
              Create Folder
            </button>
          </div>
        </div>

        {/* Sort Status Label */}
        {hasUserSorted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            key={`${sortBy}-${sortOrder}`}
            className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50/40 text-indigo-600 rounded-2xl w-fit border border-indigo-100/30 backdrop-blur-sm self-start"
          >
            <div className="flex items-center gap-2">
              <span className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-indigo-400">
                Sorted by
              </span>
              <div className="w-1 h-1 rounded-full bg-indigo-200" />
            </div>
            <span className="text-sm font-extrabold flex items-center gap-2">
              {sortBy === "date" ? (
                <Calendar size={14} strokeWidth={2.5} />
              ) : sortBy === "category" ? (
                <Tag size={14} strokeWidth={2.5} />
              ) : (
                <Type size={14} strokeWidth={2.5} />
              )}
              <span className="capitalize">{sortBy}</span>
              <span className="text-indigo-300 mx-1">•</span>
              <span className="text-indigo-500/80">
                {sortBy === "date"
                  ? sortOrder === "desc"
                    ? "Newest first"
                    : "Oldest first"
                  : sortOrder === "desc"
                    ? "Z to A"
                    : "A to Z"}
              </span>
              {sortOrder === "desc" ? (
                <SortDesc size={14} strokeWidth={2.5} />
              ) : (
                <SortAsc size={14} strokeWidth={2.5} />
              )}
            </span>
          </motion.div>
        )}
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {isLoading ? (
          // Loading Skeletons
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-slate-100 rounded-[2.5rem] aspect-[4/5]"
            />
          ))
        ) : processedFolders.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-medium text-lg">
              {searchQuery
                ? `No results found for "${searchQuery}"`
                : "No folders yet. Start by creating one!"}
            </p>
          </div>
        ) : (
          processedFolders.map((folder, index) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
              onClick={() => {
                setSelectedFolder(folder);
                setCurrentImageIndex(0);
              }}
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
                          className="w-full h-full rounded-[2.2rem] overflow-hidden shadow-[0_15px_35px_-12px_rgba(0,0,0,0.15)] bg-white "
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
          ))
        )}
      </div>

      {/* Folder Detail Modal */}
      <FolderDetailModal
        isOpen={!!selectedFolder && !isCreateModalOpen}
        folder={selectedFolder}
        onClose={() => setSelectedFolder(null)}
        onEdit={() => setIsCreateModalOpen(true)}
        onDelete={handleDeleteFolder}
        onAnalyze={handleAnalyzeFolder}
        isAnalyzing={isAnalyzingFolder}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
      />

      {/* Create/Edit Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
        onSave={handleSaveFolder}
        initialData={
          selectedFolder
            ? {
                title: selectedFolder.title,
                description: selectedFolder.description,
                aesthetic: selectedFolder.aesthetic,
                images: selectedFolder.images,
              }
            : undefined
        }
      />
    </div>
  );
}
