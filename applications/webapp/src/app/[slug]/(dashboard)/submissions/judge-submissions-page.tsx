import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions-page";
import { useAppSelector } from "@/app/_store/store";

export function JudgeSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.judgeDashboard.submissions,
  );

  return <SubmissionsPage submissions={submissions} canEdit />;
}
