import { createClient } from "@/lib/supabase/server";
import ClosetClient from "@/components/closet/ClosetClient";

export const metadata = {
  title: "My Closet — StyLens",
  description: "Manage your fashion folders and outfit collections.",
};

export default async function ClosetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1">
      <ClosetClient initialUser={user} />
    </div>
  );
}
