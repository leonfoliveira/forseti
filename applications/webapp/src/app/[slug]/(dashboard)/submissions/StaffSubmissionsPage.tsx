import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";

export function StaffSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.staffDashboard.submissions,
  );
  const problems = useAppSelector((state) => state.staffDashboard.problems);

  return (
    <SubmissionsPage
      submissions={submissions}
      problems={problems}
      canDownloadAny
    />
  );
}
