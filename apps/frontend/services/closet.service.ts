import { createClient } from "@/lib/supabase/client";

export interface Folder {
  id: string;
  user_id: string;
  title: string;
  description: string;
  aesthetic: string[];
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Service to handle closet folder operations using the Supabase client.
 */
export const closetService = {
  /**
   * Fetches all closet folders for the current authenticated user.
   */
  async getFolders(): Promise<Folder[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching folders:", error.message);
      throw error;
    }

    return data as Folder[];
  },

  /**
   * Creates a new closet folder and uploads associated images.
   */
  async createFolder(
    title: string,
    description: string,
    aesthetic: string[],
    imageFiles: File[]
  ): Promise<Folder> {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const imageUrls: string[] = [];

    // Upload each image to the 'closet' bucket
    for (const file of imageFiles) {
      const fileExt = file.name.split(".").pop();
      // Generate a unique file name
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("closet")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError.message);
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const {
        data: { publicUrl },
      } = supabase.storage.from("closet").getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }

    // Insert the folder record into the database
    const { data, error } = await supabase
      .from("folders")
      .insert({
        user_id: user.id,
        title,
        description,
        aesthetic: JSON.stringify(aesthetic),
        image_urls: imageUrls,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating folder record:", error.message);
      throw error;
    }

    return data as Folder;
  },

  /**
   * Updates an existing folder's metadata and handles new image uploads.
   */
  async updateFolder(
    id: string,
    data: {
      title: string;
      description: string;
      aesthetic: string[];
      existingImageUrls: string[];
      newImageFiles: File[];
    }
  ): Promise<Folder> {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const imageUrls = [...data.existingImageUrls];

    // Upload new images
    for (const file of data.newImageFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.floor(
        Math.random() * 1000
      )}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("closet")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading new image:", uploadError.message);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("closet").getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }

    // Update the record with combined image URLs
    const { data: updatedFolder, error } = await supabase
      .from("folders")
      .update({
        title: data.title,
        description: data.description,
        aesthetic: JSON.stringify(data.aesthetic),
        image_urls: imageUrls,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating folder:", error.message);
      throw error;
    }

    return updatedFolder as Folder;
  },

  /**
   * Deletes a folder and its associated record.
   * Note: In a production app, we would also delete images from storage.
   */
  async deleteFolder(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("folders").delete().eq("id", id);

    if (error) {
      console.error("Error deleting folder:", error.message);
      throw error;
    }
  },
};
