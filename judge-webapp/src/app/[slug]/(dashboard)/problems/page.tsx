"use client";

import { AdminProblemsPage } from "@/app/[slug]/(dashboard)/problems/admin-problems-page";
import { ContestantProblemsPage } from "@/app/[slug]/(dashboard)/problems/contestant-problems-page";
import { GuestProblemsPage } from "@/app/[slug]/(dashboard)/problems/guest-problems-page";
import { JudgeProblemsPage } from "@/app/[slug]/(dashboard)/problems/judge-problems-page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useAppSelector } from "@/store/store";

export default function DashboardProblemsPage() {
  const authorization = useAppSelector((state) => state.authorization);

  switch (authorization?.member.type) {
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
