"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";
import { useJudgeDashboard } from "@/store/slices/judge-dashboard-slice";

export default function JudgeAnnouncementsPage() {
  const { id } = useContestMetadata();
  const announcements = useJudgeDashboard(
    (state) => state.contest.announcements,
  );

  return (
    <AnnouncementsPage contestId={id} announcements={announcements} canCreate />
  );
}
