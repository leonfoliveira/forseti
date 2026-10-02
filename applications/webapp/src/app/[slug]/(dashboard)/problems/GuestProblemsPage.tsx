"use client";

import React from "react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";
import { useAppSelector } from "@/app/_store/Store";

export function GuestProblemsPage() {
  const problems = useAppSelector((state) => state.guestDashboard.problems);

  return <ProblemsPage problems={problems} />;
}
