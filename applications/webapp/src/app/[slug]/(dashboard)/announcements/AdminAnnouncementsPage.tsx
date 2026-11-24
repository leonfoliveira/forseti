import React from "react";

import { AdminDashboardSlice } from "@/app/_lib/store/slice/dashboard/AdminDashboardSlice";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage";

export function AdminAnnouncementsPage() {
  const announcements = useAppSelector(
    (state) => state.adminDashboard.announcements,
  );
  const dispatch = useAppDispatch();

  return (
    <AnnouncementsPage
      announcements={announcements}
      onCreate={(announcement) =>
        dispatch(AdminDashboardSlice.actions.mergeAnnouncement(announcement))
      }
    />
  );
}
