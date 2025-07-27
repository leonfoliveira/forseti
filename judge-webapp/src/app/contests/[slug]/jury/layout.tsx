"use client";

import React from "react";
import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { JuryContextProvider } from "@/app/contests/[slug]/jury/_context/jury-context";
import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";
import { useTranslations } from "next-intl";
import { useAuthorization } from "@/app/_context/authorization-context";
import { MemberType } from "@/core/domain/enumerate/MemberType";

export default function JuryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorization = useAuthorization();
  const contestMetadata = useContestMetadata();
  const t = useTranslations("contests.[slug].jury");

  if (!authorization?.member.type) {
    return redirect(routes.CONTEST_SIGN_IN(contestMetadata.slug));
  }
  if (authorization.member.type !== MemberType.JURY) {
    return redirect(routes.FORBIDDEN);
  }

  return (
    <ContestDashboardLayout
      contestMetadata={contestMetadata}
      tabs={[
        {
          label: t("leaderboard"),
          path: routes.CONTEST_JURY_LEADERBOARD(contestMetadata.slug),
        },
        {
          label: t("problems"),
          path: routes.CONTEST_JURY_PROBLEMS(contestMetadata.slug),
        },
        {
          label: t("submissions"),
          path: routes.CONTEST_JURY_SUBMISSIONS(contestMetadata.slug),
        },
        {
          label: t("clarifications"),
          path: routes.CONTEST_JURY_CLARIFICATIONS(contestMetadata.slug),
        },
        {
          label: t("announcements"),
          path: routes.CONTEST_JURY_ANNOUNCEMENTS(contestMetadata.slug),
        },
      ]}
    >
      <JuryContextProvider>{children}</JuryContextProvider>
    </ContestDashboardLayout>
  );
}
