import { getUser } from "@/lib/auth";
import HomepageClient from "@/components/homepage/HomepageClient";

export default async function Homepage() {
  const user = await getUser();

  return <HomepageClient initialUser={user} />;
}
