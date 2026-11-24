import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";

export function SpectatorSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.spectatorDashboard.submissions,
  );
  const problems = useAppSelector((state) => state.spectatorDashboard.problems);

  return <SubmissionsPage submissions={submissions} problems={problems} />;
}
