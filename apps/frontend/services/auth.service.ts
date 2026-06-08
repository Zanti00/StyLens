import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export type AuthenticatedUser = User & { fullname?: string };

/**
 * Service to handle authentication-related data fetching on the server.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
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
    
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.warn("Warning: Could not fetch profile full_name:", profileError.message);
    }

    return {
      ...user,
      fullname: profile?.full_name || user.user_metadata?.full_name || user.email,
    };
  } catch (error) {
    console.error("Unexpected error in getAuthenticatedUser:", error);
    return null;
  }
}
