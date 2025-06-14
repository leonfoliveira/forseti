"use client";

import React from "react";
import ContestDashboardLayout from "@/app/contests/[slug]/_component/contest-dashboard-layout";

export default function ContestantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ContestDashboardLayout>{children}</ContestDashboardLayout>;
}
