"use client";

import React from "react";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { WaitPage } from "@/app/contests/[slug]/_common/wait-page";
import { ContestTabBar } from "@/app/contests/[slug]/_component/contest-tab-bar";
import { ContestUtil } from "@/core/util/contest-util";
import { Navbar } from "@/app/_component/navbar";
import { routes } from "@/config/routes";
import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";

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
    <>
      <Navbar
        contestMetadata={contestMetadata}
        signInPath={routes.CONTEST_SIGN_IN(contestMetadata.slug, true)}
      />
      <ContestTabBar />
      <div className="p-5 bg-base-100">{children}</div>
    </>
  );
}
