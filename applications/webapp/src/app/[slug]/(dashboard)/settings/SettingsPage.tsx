"use client";

import { Navigate } from "react-router-dom";

import { AdminSettingsPage } from "@/app/[slug]/(dashboard)/settings/AdminSettingsPage";
import { useAppSelector } from "@/app/_lib/store/Store";
import { MemberType } from "@/domain/enumerate/MemberType";

/**
 * Page displaying the settings for the contest.
 */
export default function SettingsPage() {
  const session = useAppSelector((state) => state.session);

  if (
    !session ||
    ![MemberType.ROOT, MemberType.ADMIN].includes(session?.member.type)
  ) {
    return <Navigate to="/forbidden" />;
  }

  return <AdminSettingsPage />;
}
