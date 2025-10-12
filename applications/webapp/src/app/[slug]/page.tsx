import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default async function ContestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return redirect(routes.CONTEST_LEADERBOARD(slug));
}
