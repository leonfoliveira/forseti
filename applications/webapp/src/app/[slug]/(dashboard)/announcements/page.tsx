"use client";

import { AdminAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/AdminAnnouncementsPage";
import { ContestantAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/ContestantAnnouncementsPage";
import { GuestAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/GuestAnnouncementsPage";
import { JudgeAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/JudgeAnnouncementsPage";
import { useAppSelector } from "@/app/_lib/store/Store";
import { MemberType } from "@/domain/enumerate/MemberType";

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
