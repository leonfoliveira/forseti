import { redirect } from "next/navigation";
import { use } from "react";
import { routes } from "@/app/_routes";

export default function ContestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return redirect(routes.CONTEST_LEADERBOARD(slug));
}
