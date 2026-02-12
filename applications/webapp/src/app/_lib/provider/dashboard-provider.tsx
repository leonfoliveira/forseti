"use client";

import { WaitPage } from "@/app/[slug]/(dashboard)/_common/wait-page";
import { AdminDashboardProvider } from "@/app/_lib/provider/admin-dashboard-provider";
import { ContestantDashboardProvider } from "@/app/_lib/provider/contestant-dashboard-provider";
import { GuestDashboardProvider } from "@/app/_lib/provider/guest-dashboard-provider";
import { JudgeDashboardProvider } from "@/app/_lib/provider/judge-dashboard-provider";
import { useContestStatusWatcher } from "@/app/_lib/hook/contest-status-watcher-hook";
import { useAppSelector } from "@/app/_store/store";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { MemberType } from "@/core/domain/enumerate/MemberType";

/**
 * Main dashboard provider that selects the appropriate dashboard provider
 * based on the user's member type and contest status.
 */
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const session = useAppSelector((state) => state.session);
  const contestStatus = useContestStatusWatcher();

  switch (session?.member?.type) {
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
