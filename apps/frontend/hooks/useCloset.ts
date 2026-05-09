import React from "react";
import { useRouter } from "next/navigation";
import { closetService } from "@/services/closet.service";
import { Folder, mapDBFolderToUI } from "@/lib/mappers/closet";

export const useCloset = () => {
  const router = useRouter();
  
  // State
  const [folders, setFolders] = React.useState<Folder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"date" | "category" | "title">(
    "date",
  );
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [hasUserSorted, setHasUserSorted] = React.useState(false);
  const [selectedFolder, setSelectedFolder] = React.useState<Folder | null>(
    null,
  );
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isAnalyzingFolder, setIsAnalyzingFolder] = React.useState(false);

  // Derived state
  const processedFolders = React.useMemo(() => {
    let result = [...folders];

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

  // Handlers
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
        const newFolder = await closetService.createFolder(
          data.title,
          data.description,
          data.aesthetic,
          newFiles,
        );
        setFolders((prev) => [mapDBFolderToUI(newFolder), ...prev]);
      }
      setIsCreateModalOpen(false);
      setSelectedFolder(null);
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
      sessionStorage.setItem(
        "pending_analysis_images",
        JSON.stringify(folder.images),
      );
      router.push("/homepage");
    } catch (error) {
      console.error("Failed to prepare folder for analysis:", error);
    }
  };

  // Initial fetch
  React.useEffect(() => {
    fetchFolders();
  }, []);

  return {
    // State
    folders,
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
    
    // Handlers
    handleSaveFolder,
    handleDeleteFolder,
    handleAnalyzeFolder,
    fetchFolders,
  };
};
