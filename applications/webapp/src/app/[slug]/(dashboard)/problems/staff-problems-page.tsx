"use client";

import React from "react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/problems-page";
import { useAppSelector } from "@/app/_store/store";

export function StaffProblemsPage() {
  const problems = useAppSelector((state) => state.staffDashboard.problems);

  return <ProblemsPage problems={problems} />;
}
