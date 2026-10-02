"use client";

import { AdminSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/AdminSubmissionsPage";
import { ContestantSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/ContestantSubmissionsPage";
import { GuestSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/GuestSubmissionsPage";
import { JudgeSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/JudgeSubmissionsPage";
import { useAppSelector } from "@/app/_store/Store";
import { MemberType } from "@/domain/enumerate/MemberType";

export default function DashboardSubmissionsPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminSubmissionsPage />;
    case MemberType.JUDGE:
      return <JudgeSubmissionsPage />;
    case MemberType.CONTESTANT:
      return <ContestantSubmissionsPage />;
    default:
      return <GuestSubmissionsPage />;
  }
}
