import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { useAppSelector } from "@/app/_store/store";

export function StaffSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.staffDashboard.submissions,
  );
  const problems = useAppSelector((state) => state.staffDashboard.problems);

  return <SubmissionsPage submissions={submissions} problems={problems} />;
}
