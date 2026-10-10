"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function GuestAnnouncementsPage() {
  const announcements = useAppSelector(
    (state) => state.guestDashboard.announcements,
  );

  return <AnnouncementsPage announcements={announcements} />;
}
