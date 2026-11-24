import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage";

export function SpectatorAnnouncementsPage() {
  const announcements = useAppSelector(
    (state) => state.spectatorDashboard.announcements,
  );

  return <AnnouncementsPage announcements={announcements} />;
}
