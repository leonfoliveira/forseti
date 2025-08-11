"use client";

import React from "react";
import { defineMessages } from "react-intl";

import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { GuestContextProvider } from "@/app/contests/[slug]/guest/_context/guest-context";
import { routes } from "@/config/routes";
import { useContest } from "@/store/slices/contest-slice";

const messages = defineMessages({
  tabLeaderboard: {
    id: "app.contests.[slug].guest.layout.tab-leaderboard",
    defaultMessage: "Leaderboard",
  },
  tabProblems: {
    id: "app.contests.[slug].guest.layout.tab-problems",
    defaultMessage: "Problems",
  },
  tabTimeline: {
    id: "app.contests.[slug].guest.layout.tab-timeline",
    defaultMessage: "Timeline",
  },
  tabClarifications: {
    id: "app.contests.[slug].guest.layout.tab-clarifications",
    defaultMessage: "Clarifications",
  },
  tabAnnouncements: {
    id: "app.contests.[slug].guest.layout.tab-announcements",
    defaultMessage: "Announcements",
  },
});

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contestMetadata = useContest();

  return (
    <ContestDashboardLayout
      contestMetadata={contestMetadata}
      tabs={[
        {
          label: messages.tabLeaderboard,
          path: routes.CONTEST_GUEST_LEADERBOARD(contestMetadata.slug),
        },
        {
          label: messages.tabProblems,
          path: routes.CONTEST_GUEST_PROBLEMS(contestMetadata.slug),
        },
        {
          label: messages.tabTimeline,
          path: routes.CONTEST_GUEST_TIMELINE(contestMetadata.slug),
        },
        {
          label: messages.tabClarifications,
          path: routes.CONTEST_GUEST_CLARIFICATIONS(contestMetadata.slug),
        },
        {
          label: messages.tabAnnouncements,
          path: routes.CONTEST_GUEST_ANNOUNCEMENTS(contestMetadata.slug),
        },
      ]}
    >
      <GuestContextProvider>{children}</GuestContextProvider>
    </ContestDashboardLayout>
  );
}
