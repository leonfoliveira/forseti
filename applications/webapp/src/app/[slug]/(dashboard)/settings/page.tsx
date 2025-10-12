"use client";

import { forbidden } from "next/navigation";

import { AdminSettingsPage } from "@/app/[slug]/(dashboard)/settings/admin-settings-page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useAppSelector } from "@/store/store";

export default function DashboardSettingsPage() {
  const session = useAppSelector((state) => state.session);

  if (
    !session ||
    ![MemberType.ROOT, MemberType.ADMIN].includes(session?.member.type)
  ) {
    forbidden();
  }

  return <AdminSettingsPage />;
}
