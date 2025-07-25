"use client";

import React from "react";
import ContestDashboardLayout from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { useContestMetadata } from "../_context/contest-metadata-context";
import { ContestantContextProvider } from "@/app/contests/[slug]/contestant/_context/contestant-context";
import { useTranslations } from "next-intl";
import { useAuthorization } from "@/app/_context/authorization-context";
import { MemberType } from "@/core/domain/enumerate/MemberType";

export default function ContestantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorization = useAuthorization();
  const contestMetadata = useContestMetadata();
  const t = useTranslations("contests.[slug].contestant");

  if (!authorization?.member.type) {
    return redirect(routes.CONTEST_SIGN_IN(contestMetadata.slug));
  }
  if (authorization.member.type !== MemberType.CONTESTANT) {
    return redirect(routes.FORBIDDEN);
  }

  return (
    <ContestDashboardLayout
      contestMetadata={contestMetadata}
      tabs={[
        {
          label: t("leaderboard"),
          path: routes.CONTEST_CONTESTANT_LEADERBOARD(contestMetadata.slug),
        },
        {
          label: t("problems"),
          path: routes.CONTEST_CONTESTANT_PROBLEMS(contestMetadata.slug),
        },
        {
          label: t("timeline"),
          path: routes.CONTEST_CONTESTANT_TIMELINE(contestMetadata.slug),
        },
        {
          label: t("submissions"),
          path: routes.CONTEST_CONTESTANT_SUBMISSIONS(contestMetadata.slug),
        },
        {
          label: t("clarifications"),
          path: routes.CONTEST_CONTESTANT_CLARIFICATIONS(contestMetadata.slug),
        },
        {
          label: t("announcements"),
          path: routes.CONTEST_CONTESTANT_ANNOUNCEMENTS(contestMetadata.slug),
        },
      ]}
    >
      <ContestantContextProvider>{children}</ContestantContextProvider>
    </ContestDashboardLayout>
  );
}
