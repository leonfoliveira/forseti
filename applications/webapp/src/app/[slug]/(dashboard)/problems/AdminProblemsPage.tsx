"use client";

import React from "react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function AdminProblemsPage() {
  const problems = useAppSelector((state) => state.adminDashboard.problems);

  return <ProblemsPage problems={problems} canDownloadTestCases />;
}
