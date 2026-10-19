import React from "react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function SpectatorProblemsPage() {
  const problems = useAppSelector((state) => state.spectatorDashboard.problems);

  return <ProblemsPage problems={problems} />;
}
