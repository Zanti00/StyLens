import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

/**
 * Service to handle authentication-related data fetching on the server.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (error.message !== "Auth session missing!") {
        console.error("Error fetching user:", error.message);
      }
      return null;
    }

    return user;
  } catch (error) {
    console.error("Unexpected error in getAuthenticatedUser:", error);
    return null;
  }
}
