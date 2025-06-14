"use client";

import React from "react";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { WaitPage } from "@/app/contests/[slug]/_component/page/wait-page";
import { ContestNavbar } from "@/app/contests/[slug]/_component/contest-navbar";
import { ContestTabBar } from "@/app/contests/[slug]/_component/contest-tab-bar";
import { ContestProvider } from "@/app/contests/[slug]/_component/context/contest-context";

export default function ContestDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contest = useContestMetadata();

  if (contest.status === ContestStatus.NOT_STARTED) {
    return <WaitPage />;
  }

  return (
    <ContestProvider>
      <ContestNavbar />
      <div className="mt-2">
        <ContestTabBar />
        <div className="p-5 bg-base-100">{children}</div>
      </div>
    </ContestProvider>
  );
}
