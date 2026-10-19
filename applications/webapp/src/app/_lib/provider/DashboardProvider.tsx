import { WaitPage } from "@/app/[slug]/(dashboard)/_common/WaitPage";
import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";
import { AdminDashboardProvider } from "@/app/_lib/provider/dashboard/AdminDashboardProvider";
import { ContestantDashboardProvider } from "@/app/_lib/provider/dashboard/ContestantDashboardProvider";
import { SpectatorDashboardProvider } from "@/app/_lib/provider/dashboard/SpectatorDashboardProvider";
import { JudgeDashboardProvider } from "@/app/_lib/provider/dashboard/JudgeDashboardProvider";
import { StaffDashboardProvider } from "@/app/_lib/provider/dashboard/StaffDashboardProvider";
import { useAppSelector } from "@/app/_lib/store/Store";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MemberType } from "@/domain/enumerate/MemberType";

/**
 * Main dashboard provider that selects the appropriate dashboard provider
 * based on the user's member type and contest status.
 */
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const session = useAppSelector((state) => state.session);
  const contestStatus = useContestStatusWatcher();

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminDashboardProvider>{children}</AdminDashboardProvider>;
    case MemberType.JUDGE:
      return <JudgeDashboardProvider>{children}</JudgeDashboardProvider>;
    case MemberType.STAFF:
      return <StaffDashboardProvider>{children}</StaffDashboardProvider>;
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
      return (
        <SpectatorDashboardProvider>{children}</SpectatorDashboardProvider>
      );
  }
}
