"use client";

import { AdminSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/admin-submissions-page";
import { ContestantSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/contestant-submissions-page";
import { GuestSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/guest-submissions-page";
import { JudgeSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/judge-submissions-page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useAppSelector } from "@/store/store";

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
