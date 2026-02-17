"use client";

import { AdminSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/admin-submissions-page";
import { ContestantSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/contestant-submissions-page";
import { GuestSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/guest-submissions-page";
import { JudgeSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/judge-submissions-page";
import { StaffSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/staff-submissions-page";
import { useAppSelector } from "@/app/_store/store";
import { MemberType } from "@/core/domain/enumerate/MemberType";

export default function DashboardSubmissionsPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminSubmissionsPage />;
    case MemberType.STAFF:
      return <StaffSubmissionsPage />;
    case MemberType.JUDGE:
      return <JudgeSubmissionsPage />;
    case MemberType.CONTESTANT:
      return <ContestantSubmissionsPage />;
    default:
      return <GuestSubmissionsPage />;
  }
}
