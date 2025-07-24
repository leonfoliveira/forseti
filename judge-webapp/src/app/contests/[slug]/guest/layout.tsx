"use client";

import React from "react";
import ContestDashboardLayout from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { GuestContextProvider } from "@/app/contests/[slug]/guest/_context/guest-context";

export default function ContestantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContestDashboardLayout>
      <GuestContextProvider>{children}</GuestContextProvider>
    </ContestDashboardLayout>
  );
}
