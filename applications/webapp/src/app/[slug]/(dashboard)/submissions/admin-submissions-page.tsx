import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions-page";
import { useAppSelector } from "@/app/_store/store";

export function AdminSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.adminDashboard.submissions,
  );
  const problems = useAppSelector(
    (state) => state.adminDashboard.contest.problems,
  );
  const languages = useAppSelector(
    (state) => state.adminDashboard.contest.languages,
  );

  return (
    <SubmissionsPage
      submissions={submissions}
      problems={problems}
      languages={languages}
      canEdit
    />
  );
}
