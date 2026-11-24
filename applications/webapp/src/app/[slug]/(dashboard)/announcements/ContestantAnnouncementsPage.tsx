import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage";

export function ContestantAnnouncementsPage() {
  const announcements = useAppSelector(
    (state) => state.contestantDashboard.announcements,
  );

  return <AnnouncementsPage announcements={announcements} />;
}
