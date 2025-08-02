"use client";

import React from "react";
import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { JudgeContextProvider } from "@/app/contests/[slug]/judge/_context/judge-context";
import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";
import { useTranslations } from "next-intl";
import { useAuthorization } from "@/app/_context/authorization-context";
import { MemberType } from "@/core/domain/enumerate/MemberType";

export default function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorization = useAuthorization();
  const contestMetadata = useContestMetadata();
  const t = useTranslations("contests.[slug].judge.layout");

  if (!authorization?.member.type) {
    return redirect(routes.CONTEST_SIGN_IN(contestMetadata.slug));
  }
  if (authorization.member.type !== MemberType.JUDGE) {
    return redirect(routes.FORBIDDEN);
  }

  return (
    <ContestDashboardLayout
      contestMetadata={contestMetadata}
      tabs={[
        {
          label: t("tab-leaderboard"),
          path: routes.CONTEST_JUDGE_LEADERBOARD(contestMetadata.slug),
        },
        {
          label: t("tab-problems"),
          path: routes.CONTEST_JUDGE_PROBLEMS(contestMetadata.slug),
        },
        {
          label: t("tab-submissions"),
          path: routes.CONTEST_JUDGE_SUBMISSIONS(contestMetadata.slug),
        },
        {
          label: t("tab-clarifications"),
          path: routes.CONTEST_JUDGE_CLARIFICATIONS(contestMetadata.slug),
        },
        {
          label: t("tab-announcements"),
          path: routes.CONTEST_JUDGE_ANNOUNCEMENTS(contestMetadata.slug),
        },
      ]}
    >
      <JudgeContextProvider>{children}</JudgeContextProvider>
    </ContestDashboardLayout>
  );
}
