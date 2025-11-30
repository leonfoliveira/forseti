"use client";

import { forbidden } from "next/navigation";

import { AdminSettingsPage } from "@/app/[slug]/(dashboard)/settings/admin-settings-page";
import { useAppSelector } from "@/app/_store/store";
import { MemberType } from "@/core/domain/enumerate/MemberType";

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
