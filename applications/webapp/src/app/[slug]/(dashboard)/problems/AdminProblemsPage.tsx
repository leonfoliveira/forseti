import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";

export function AdminProblemsPage() {
  const problems = useAppSelector((state) => state.adminDashboard.problems);

  return <ProblemsPage problems={problems} canDownloadTestCases />;
}
