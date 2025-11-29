"use client";

import { AdminProblemsPage } from "@/app/[slug]/(dashboard)/problems/admin-problems-page";
import { ContestantProblemsPage } from "@/app/[slug]/(dashboard)/problems/contestant-problems-page";
import { GuestProblemsPage } from "@/app/[slug]/(dashboard)/problems/guest-problems-page";
import { JudgeProblemsPage } from "@/app/[slug]/(dashboard)/problems/judge-problems-page";
import { useAppSelector } from "@/app/_store/store";
import { MemberType } from "@/core/domain/enumerate/MemberType";

export default function DashboardProblemsPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminProblemsPage />;
    case MemberType.JUDGE:
      return <JudgeProblemsPage />;
    case MemberType.CONTESTANT:
      return <ContestantProblemsPage />;
    default:
      return <GuestProblemsPage />;
  }
}
