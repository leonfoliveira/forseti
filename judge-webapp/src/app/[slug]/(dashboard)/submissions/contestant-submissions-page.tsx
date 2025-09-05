import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions-page";
import { useAppSelector } from "@/store/store";

export function ContestantSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.contestantDashboard.data!.submissions,
  );
  const problems = useAppSelector(
    (state) => state.contestantDashboard.data!.contest.problems,
  );
  const languages = useAppSelector(
    (state) => state.contestantDashboard.data!.contest.languages,
  );

  return (
    <SubmissionsPage
      submissions={submissions}
      problems={problems}
      languages={languages}
      canCreate
    />
  );
}
