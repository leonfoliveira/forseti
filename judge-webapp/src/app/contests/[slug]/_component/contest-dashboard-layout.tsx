"use client";

import React from "react";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { WaitPage } from "@/app/contests/[slug]/_common/wait-page";
import { ContestTabBar } from "@/app/contests/[slug]/_component/contest-tab-bar";
import { ContestProvider } from "@/app/contests/[slug]/_component/context/contest-context";
import { ContestUtil } from "@/core/util/contest-util";
import { Navbar } from "@/app/_component/navbar";
import { routes } from "@/routes";

/**
 * Basic layout for contest dashboard pages.
 */
export default function ContestDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contestMetadata = useContestMetadata();

  if (ContestUtil.getStatus(contestMetadata) === ContestStatus.NOT_STARTED) {
    return <WaitPage />;
  }

  return (
    <ContestProvider>
      <Navbar
        contestMetadata={contestMetadata}
        signInPath={routes.CONTEST_SIGN_IN(contestMetadata.slug, true)}
      />
      <ContestTabBar />
      <div className="p-5 bg-base-100">{children}</div>
    </ContestProvider>
  );
}
