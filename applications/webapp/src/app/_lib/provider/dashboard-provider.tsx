"use client";

import { useRouter } from "next/navigation";

import { WaitPage } from "@/app/[slug]/(dashboard)/_common/wait-page";
import { useContestStatusWatcher } from "@/app/_lib/hook/contest-status-watcher-hook";
import { AdminDashboardProvider } from "@/app/_lib/provider/dashboard/admin-dashboard-provider";
import { ContestantDashboardProvider } from "@/app/_lib/provider/dashboard/contestant-dashboard-provider";
import { GuestDashboardProvider } from "@/app/_lib/provider/dashboard/guest-dashboard-provider";
import { JudgeDashboardProvider } from "@/app/_lib/provider/dashboard/judge-dashboard-provider";
import { StaffDashboardProvider } from "@/app/_lib/provider/dashboard/staff-dashboard-provider";
import { useAppSelector } from "@/app/_store/store";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { MemberType } from "@/core/domain/enumerate/MemberType";

/**
 * Main dashboard provider that selects the appropriate dashboard provider
 * based on the user's member type and contest status.
 */
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const session = useAppSelector((state) => state.session);
  const contestSlug = useAppSelector((state) => state.contest.slug);
  const isGuestEnabled = useAppSelector(
    (state) => state.contest.settings.isGuestEnabled,
  );
  const contestStatus = useContestStatusWatcher();
  const router = useRouter();

  switch (session?.member?.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminDashboardProvider>{children}</AdminDashboardProvider>;
    case MemberType.STAFF:
      return <StaffDashboardProvider>{children}</StaffDashboardProvider>;
    case MemberType.JUDGE:
      return <JudgeDashboardProvider>{children}</JudgeDashboardProvider>;
    case MemberType.CONTESTANT:
    case MemberType.UNOFFICIAL_CONTESTANT:
      if (contestStatus === ContestStatus.NOT_STARTED) {
        return <WaitPage />;
      }
      return (
        <ContestantDashboardProvider>{children}</ContestantDashboardProvider>
      );
    default:
      if (!isGuestEnabled) {
        router.replace(routes.CONTEST_SIGN_IN(contestSlug));
      }
      if (contestStatus === ContestStatus.NOT_STARTED) {
        return <WaitPage />;
      }
      return <GuestDashboardProvider>{children}</GuestDashboardProvider>;
  }
}
