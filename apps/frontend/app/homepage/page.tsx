import { createClient } from "@/lib/supabase/server";
import HomepageClient from "@/components/homepage/HomepageClient";

export default async function Homepage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HomepageClient initialUser={user} />;
}
