"use client";

import { AdminAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/admin-announcements-page";
import { ContestantAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/contestant-announcements-page";
import { GuestAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/guest-announcements-page";
import { JudgeAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/judge-announcements-page";
import { useAppSelector } from "@/app/_store/store";
import { MemberType } from "@/core/domain/enumerate/MemberType";

export default function DashboardAnnouncementsPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminAnnouncementsPage />;
    case MemberType.JUDGE:
      return <JudgeAnnouncementsPage />;
    case MemberType.CONTESTANT:
      return <ContestantAnnouncementsPage />;
    default:
      return <GuestAnnouncementsPage />;
  }
}
