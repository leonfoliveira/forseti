"use client";

import React from "react";
import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { GuestContextProvider } from "@/app/contests/[slug]/guest/_context/guest-context";
import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";
import { routes } from "@/config/routes";
import { useTranslations } from "next-intl";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contestMetadata = useContestMetadata();
  const t = useTranslations("contests.[slug].guest.layout");

  return (
    <ContestDashboardLayout
      contestMetadata={contestMetadata}
      tabs={[
        {
          label: t("tab-leaderboard"),
          path: routes.CONTEST_GUEST_LEADERBOARD(contestMetadata.slug),
        },
        {
          label: t("tab-problems"),
          path: routes.CONTEST_GUEST_PROBLEMS(contestMetadata.slug),
        },
        {
          label: t("tab-timeline"),
          path: routes.CONTEST_GUEST_TIMELINE(contestMetadata.slug),
        },
        {
          label: t("tab-clarifications"),
          path: routes.CONTEST_GUEST_CLARIFICATIONS(contestMetadata.slug),
        },
        {
          label: t("tab-announcements"),
          path: routes.CONTEST_GUEST_ANNOUNCEMENTS(contestMetadata.slug),
        },
      ]}
    >
      <GuestContextProvider>{children}</GuestContextProvider>
    </ContestDashboardLayout>
  );
}
