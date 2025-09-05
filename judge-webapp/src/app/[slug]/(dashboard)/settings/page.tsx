"use client";

import { forbidden } from "next/navigation";

import { AdminSettingsPage } from "@/app/[slug]/(dashboard)/settings/admin-settings-page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useAppSelector } from "@/store/store";

export default function DashboardSettingsPage() {
  const authorization = useAppSelector((state) => state.authorization);

  if (
    !authorization ||
    ![MemberType.ROOT, MemberType.ADMIN].includes(authorization?.member.type)
  ) {
    forbidden();
  }

  return <AdminSettingsPage />;
}
