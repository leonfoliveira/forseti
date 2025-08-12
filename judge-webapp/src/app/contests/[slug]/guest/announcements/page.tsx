"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";
import { useGuestDashboard } from "@/store/slices/guest-dashboard-slice";

export default function GuestAnnouncementsPage() {
  const { id } = useContestMetadata();
  const announcements = useGuestDashboard(
    (state) => state.contest.announcements,
  );

  return <AnnouncementsPage contestId={id} announcements={announcements} />;
}
