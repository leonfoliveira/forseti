import { redirect } from "next/navigation";
import { use } from "react";

export default function ContestPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);

  return redirect(`/contests/${id}/leaderboard`);
}
