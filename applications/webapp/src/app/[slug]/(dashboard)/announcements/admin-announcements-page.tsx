"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page";
import { adminDashboardSlice } from "@/app/_store/slices/admin-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";

export function AdminAnnouncementsPage() {
  const announcements = useAppSelector(
    (state) => state.adminDashboard.announcements,
  );
  const dispatch = useAppDispatch();

  return (
    <AnnouncementsPage
      announcements={announcements}
      canCreate
      onCreate={(announcement) =>
        dispatch(adminDashboardSlice.actions.mergeAnnouncement(announcement))
      }
    />
  );
}
