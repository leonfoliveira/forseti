import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function SpectatorSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.spectatorDashboard.submissions,
  );
  const problems = useAppSelector((state) => state.spectatorDashboard.problems);

  return <SubmissionsPage submissions={submissions} problems={problems} />;
}
