import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage";

export function JudgeAnnouncementsPage() {
  const announcements = useAppSelector(
    (state) => state.judgeDashboard.announcements,
  );

  return <AnnouncementsPage announcements={announcements} />;
}
