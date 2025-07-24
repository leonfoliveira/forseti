"use client";

import React from "react";
import ContestDashboardLayout from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { ContestMemberType } from "@/core/domain/enumerate/ContestMemberType";
import { useContestMetadata } from "../_context/contest-metadata-context";
import { ContestantContextProvider } from "@/app/contests/[slug]/contestant/_context/contestant-context";

export default function ContestantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contestMetadata = useContestMetadata();

  if (!contestMetadata.loggedMemberType) {
    return redirect(routes.CONTEST_SIGN_IN(contestMetadata.slug));
  }
  if (contestMetadata.loggedMemberType !== ContestMemberType.CONTESTANT) {
    return redirect(routes.FORBIDDEN);
  }

  return (
    <ContestDashboardLayout>
      <ContestantContextProvider>{children}</ContestantContextProvider>
    </ContestDashboardLayout>
  );
}
