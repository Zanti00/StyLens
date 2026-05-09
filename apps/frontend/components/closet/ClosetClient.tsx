"use client";

import React from "react";
import { motion } from "framer-motion";
import { ClosetToolbar } from "./ClosetToolbar";
import { User } from "@supabase/supabase-js";
import { FolderDetailModal } from "./FolderDetailModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { FolderGrid } from "./FolderGrid";
import { useCloset } from "@/hooks/useCloset";

interface ClosetClientProps {
  initialUser: User | null;
}

export default function ClosetClient({ initialUser }: ClosetClientProps) {
  const {
    isLoading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    hasUserSorted,
    setHasUserSorted,
    selectedFolder,
    setSelectedFolder,
    currentImageIndex,
    setCurrentImageIndex,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isAnalyzingFolder,
    processedFolders,
    handleSaveFolder,
    handleDeleteFolder,
    handleAnalyzeFolder,
  } = useCloset();

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
        <ClosetToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          hasUserSorted={hasUserSorted}
          setHasUserSorted={setHasUserSorted}
          onCreateClick={() => {
            setSelectedFolder(null);
            setIsCreateModalOpen(true);
          }}
        />
      </div>

      {/* Folders Grid */}
      <FolderGrid
        folders={processedFolders}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onFolderClick={(folder) => {
          setSelectedFolder(folder);
          setCurrentImageIndex(0);
        }}
      />

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
