import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { useAppSelector } from "@/app/_store/store";

export function JudgeSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.judgeDashboard.submissions,
  );
  const problems = useAppSelector(
    (state) => state.judgeDashboard.contest.problems,
  );

  return (
    <SubmissionsPage submissions={submissions} problems={problems} canEdit />
  );
}
