import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";

export function ContestantProblemsPage() {
  const session = useAppSelector((state) => state.session);
  const problems = useAppSelector(
    (state) => state.contestantDashboard.problems,
  );
  const leaderboardRow = useAppSelector((state) =>
    state.contestantDashboard.leaderboard.rows.find(
      (it) => it.memberId === session!.member.id,
    ),
  );

  return <ProblemsPage problems={problems} leaderboardRow={leaderboardRow} />;
}
