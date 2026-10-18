import React from "react";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function StaffAnnouncementsPage() {
  const announcements = useAppSelector(
    (state) => state.staffDashboard.announcements,
  );

  return <AnnouncementsPage announcements={announcements} />;
}
