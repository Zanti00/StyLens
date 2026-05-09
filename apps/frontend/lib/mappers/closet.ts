import { Folder as DBFolder } from "@/services/closet.service";

/**
 * UI representation of a Style Folder.
 * This is derived from the database model but includes extra fields
 * optimized for display and sorting.
 */
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

/**
 * Maps a database folder object to the UI-specific Folder interface.
 * Handles parsing of aesthetic tags and formatting of timestamps.
 */
export const mapDBFolderToUI = (dbFolder: DBFolder): Folder => ({
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
