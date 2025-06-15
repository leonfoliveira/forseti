"use client";

import React from "react";
import ContestDashboardLayout from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { redirect } from "next/navigation";
import { routes } from "@/app/_routes";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";

export default function ContestantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contestMetadata = useContestMetadata();
  const { authorization } = useAuthorization();

  if (!authorization) {
    return redirect(routes.CONTEST_SIGN_IN(contestMetadata.slug));
  }
  if (authorization.member.type !== MemberType.JURY) {
    return redirect(routes.FORBIDDEN);
  }

  return <ContestDashboardLayout>{children}</ContestDashboardLayout>;
}
