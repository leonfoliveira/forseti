"use client";

import React from "react";
import ContestDashboardLayout from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { redirect } from "next/navigation";
import { routes } from "@/app/_routes";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { ContestMemberType } from "@/core/domain/enumerate/ContestMemberType";

export default function ContestantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contestMetadata = useContestMetadata();

  if (!contestMetadata.loggedMemberType) {
    return redirect(routes.CONTEST_SIGN_IN(contestMetadata.slug));
  }
  if (contestMetadata.loggedMemberType !== ContestMemberType.JURY) {
    return redirect(routes.FORBIDDEN);
  }

  return <ContestDashboardLayout>{children}</ContestDashboardLayout>;
}
