"use client";

import { WaitPage } from "@/app/[slug]/(dashboard)/_common/wait-page";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { AdminDashboardProvider } from "@/lib/provider/admin-dashboard-provider";
import { ContestantDashboardProvider } from "@/lib/provider/contestant-dashboard-provider";
import { GuestDashboardProvider } from "@/lib/provider/guest-dashboard-provider";
import { JudgeDashboardProvider } from "@/lib/provider/judge-dashboard-provider";
import { useContestStatusWatcher } from "@/lib/util/contest-status-watcher";
import { useAppSelector } from "@/store/store";

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const authorization = useAppSelector((state) => state.authorization);
  const contestStatus = useContestStatusWatcher();

  switch (authorization?.member?.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminDashboardProvider>{children}</AdminDashboardProvider>;
    case MemberType.JUDGE:
      return <JudgeDashboardProvider>{children}</JudgeDashboardProvider>;
    case MemberType.CONTESTANT:
      if (contestStatus === ContestStatus.NOT_STARTED) {
        return <WaitPage />;
      }
      return (
        <ContestantDashboardProvider>{children}</ContestantDashboardProvider>
      );
    default:
      if (contestStatus === ContestStatus.NOT_STARTED) {
        return <WaitPage />;
      }
      return <GuestDashboardProvider>{children}</GuestDashboardProvider>;
  }
}
