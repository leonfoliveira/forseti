import React from "react";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function SpectatorAnnouncementsPage() {
  const announcements = useAppSelector(
    (state) => state.spectatorDashboard.announcements,
  );

  return <AnnouncementsPage announcements={announcements} />;
}
