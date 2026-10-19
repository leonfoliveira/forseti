import { AdminLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/AdminLeaderboardPage";
import { ContestantLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/ContestantLeaderboardPage";
import { SpectatorLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/SpectatorLeaderboardPage";
import { JudgeLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/JudgeLeaderboardPage";
import { StaffLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/StaffLeaderboardPage";
import { useAppSelector } from "@/app/_lib/store/Store";
import { MemberType } from "@/domain/enumerate/MemberType";

/**
 * Page displaying the leaderboard for the contest.
 */
export default function LeaderboardPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminLeaderboardPage />;
    case MemberType.JUDGE:
      return <JudgeLeaderboardPage />;
    case MemberType.STAFF:
      return <StaffLeaderboardPage />;
    case MemberType.CONTESTANT:
      return <ContestantLeaderboardPage />;
    default:
      return <SpectatorLeaderboardPage />;
  }
}
