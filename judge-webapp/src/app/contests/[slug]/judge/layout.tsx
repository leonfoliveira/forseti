"use client";

import { redirect } from "next/navigation";
import React from "react";
import { defineMessages } from "react-intl";

import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { JudgeContextProvider } from "@/app/contests/[slug]/judge/_context/judge-context";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useAuthorization } from "@/store/slices/authorization-slice";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";

const messages = defineMessages({
  tabLeaderboard: {
    id: "app.contests.[slug].judge.layout.tab-leaderboard",
    defaultMessage: "Leaderboard",
  },
  tabProblems: {
    id: "app.contests.[slug].judge.layout.tab-problems",
    defaultMessage: "Problems",
  },
  tabSubmissions: {
    id: "app.contests.[slug].judge.layout.tab-submissions",
    defaultMessage: "Submissions",
  },
  tabClarifications: {
    id: "app.contests.[slug].judge.layout.tab-clarifications",
    defaultMessage: "Clarifications",
  },
  tabAnnouncements: {
    id: "app.contests.[slug].judge.layout.tab-announcements",
    defaultMessage: "Announcements",
  },
});

export default function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorization = useAuthorization();
  const contestMetadata = useContestMetadata();

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
          label: messages.tabLeaderboard,
          path: routes.CONTEST_JUDGE_LEADERBOARD(contestMetadata.slug),
        },
        {
          label: messages.tabProblems,
          path: routes.CONTEST_JUDGE_PROBLEMS(contestMetadata.slug),
        },
        {
          label: messages.tabSubmissions,
          path: routes.CONTEST_JUDGE_SUBMISSIONS(contestMetadata.slug),
        },
        {
          label: messages.tabClarifications,
          path: routes.CONTEST_JUDGE_CLARIFICATIONS(contestMetadata.slug),
        },
        {
          label: messages.tabAnnouncements,
          path: routes.CONTEST_JUDGE_ANNOUNCEMENTS(contestMetadata.slug),
        },
      ]}
    >
      <JudgeContextProvider>{children}</JudgeContextProvider>
    </ContestDashboardLayout>
  );
}
