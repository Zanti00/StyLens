import { getUser } from "@/lib/auth";
import ClosetClient from "@/components/closet/ClosetClient";

export const metadata = {
  title: "My Closet — StyLens",
  description: "Manage your fashion folders and outfit collections.",
};

export default async function ClosetPage() {
  const user = await getUser();

  return (
    <div className="flex-1">
      <ClosetClient initialUser={user} />
    </div>
  );
}
