"use client";

import { AdminClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/admin-clarifications-page";
import { ContestantClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/contestant-clarifications-page";
import { GuestClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/guest-clarifications-page";
import { JudgeClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/judge-clarifications-page";
import { useAppSelector } from "@/app/_store/store";
import { MemberType } from "@/core/domain/enumerate/MemberType";

export default function DashboardClarificationsPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminClarificationsPage />;
    case MemberType.JUDGE:
      return <JudgeClarificationsPage />;
    case MemberType.CONTESTANT:
      return <ContestantClarificationsPage />;
    default:
      return <GuestClarificationsPage />;
  }
}
