import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";

export function StaffProblemsPage() {
  const problems = useAppSelector((state) => state.staffDashboard.problems);

  return <ProblemsPage problems={problems} />;
}
