"use client";

import React from "react";
import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";
import { ContestantContextProvider } from "@/app/contests/[slug]/contestant/_context/contestant-context";
import { useAuthorization } from "@/store/slices/authorization-slice";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { defineMessages } from "react-intl";

const messages = defineMessages({
  tabLeaderboard: {
    id: "app.contests.[slug].contestant.layout.tab-leaderboard",
    defaultMessage: "Leaderboard",
  },
  tabProblems: {
    id: "app.contests.[slug].contestant.layout.tab-problems",
    defaultMessage: "Problems",
  },
  tabTimeline: {
    id: "app.contests.[slug].contestant.layout.tab-timeline",
    defaultMessage: "Timeline",
  },
  tabSubmissions: {
    id: "app.contests.[slug].contestant.layout.tab-submissions",
    defaultMessage: "Submissions",
  },
  tabClarifications: {
    id: "app.contests.[slug].contestant.layout.tab-clarifications",
    defaultMessage: "Clarifications",
  },
  tabAnnouncements: {
    id: "app.contests.[slug].contestant.layout.tab-announcements",
    defaultMessage: "Announcements",
  },
});

export default function ContestantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorization = useAuthorization();
  const contestMetadata = useContestMetadata();

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
          label: messages.tabLeaderboard,
          path: routes.CONTEST_CONTESTANT_LEADERBOARD(contestMetadata.slug),
        },
        {
          label: messages.tabProblems,
          path: routes.CONTEST_CONTESTANT_PROBLEMS(contestMetadata.slug),
        },
        {
          label: messages.tabTimeline,
          path: routes.CONTEST_CONTESTANT_TIMELINE(contestMetadata.slug),
        },
        {
          label: messages.tabSubmissions,
          path: routes.CONTEST_CONTESTANT_SUBMISSIONS(contestMetadata.slug),
        },
        {
          label: messages.tabClarifications,
          path: routes.CONTEST_CONTESTANT_CLARIFICATIONS(contestMetadata.slug),
        },
        {
          label: messages.tabAnnouncements,
          path: routes.CONTEST_CONTESTANT_ANNOUNCEMENTS(contestMetadata.slug),
        },
      ]}
    >
      <ContestantContextProvider>{children}</ContestantContextProvider>
    </ContestDashboardLayout>
  );
}
