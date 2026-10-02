"use client";

import { AdminLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/AdminLeaderboardPage";
import { ContestantLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/ContestantLeaderboardPage";
import { GuestLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/GuestLeaderboardPage";
import { JudgeLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/JudgeLeaderboardPage";
import { useAppSelector } from "@/app/_lib/store/Store";
import { MemberType } from "@/domain/enumerate/MemberType";

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
