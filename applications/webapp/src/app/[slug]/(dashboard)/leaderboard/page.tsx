"use client";

import { AdminLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/admin-leaderboard-page";
import { ContestantLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/contestant-leaderboard-page";
import { GuestLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/guest-leaderboard-page";
import { JudgeLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/judge-leaderboard-page";
import { useAppSelector } from "@/app/_store/store";
import { MemberType } from "@/core/domain/enumerate/MemberType";

export default function DashboardLeaderboardPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminLeaderboardPage />;
    case MemberType.JUDGE:
      return <JudgeLeaderboardPage />;
    case MemberType.CONTESTANT:
      return <ContestantLeaderboardPage />;
    default:
      return <GuestLeaderboardPage />;
  }
}
