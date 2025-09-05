"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements-page";
import { useAppSelector } from "@/store/store";

export function AdminAnnouncementsPage() {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const announcements = useAppSelector(
    (state) => state.adminDashboard.data!.contest.announcements,
  );

  return (
    <AnnouncementsPage
      contestId={contestId}
      announcements={announcements}
      canCreate
    />
  );
}
