import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { useAppSelector } from "@/app/_store/store";

export function ContestantSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.contestantDashboard.submissions,
  );
  const memberSubmissions = useAppSelector(
    (state) => state.contestantDashboard.memberSubmissions,
  );
  const problems = useAppSelector(
    (state) => state.contestantDashboard.contest.problems,
  );

  return (
    <SubmissionsPage
      submissions={submissions}
      memberSubmissions={memberSubmissions}
      problems={problems}
      canCreate
    />
  );
}
