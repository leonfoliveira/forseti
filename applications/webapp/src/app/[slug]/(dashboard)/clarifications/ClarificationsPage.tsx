import { useAppSelector } from "@/app/_lib/store/Store";
import { AdminClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/AdminClarificationsPage";
import { ContestantClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/ContestantClarificationsPage";
import { JudgeClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/JudgeClarificationsPage";
import { SpectatorClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/SpectatorClarificationsPage";
import { StaffClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/StaffClarificationsPage";
import NotFoundPage from "@/app/error/NotFoundPage";
import { MemberType } from "@/domain/enumerate/MemberType";

/**
 * Page displaying clarifications for the contest.
 */
export default function ClarificationsPage() {
  const session = useAppSelector((state) => state.session);
  const contest = useAppSelector((state) => state.contest);

  if (!contest.settings.isClarificationEnabled) {
    return <NotFoundPage />;
  }

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminClarificationsPage />;
    case MemberType.JUDGE:
      return <JudgeClarificationsPage />;
    case MemberType.STAFF:
      return <StaffClarificationsPage />;
    case MemberType.CONTESTANT:
    case MemberType.UNOFFICIAL_CONTESTANT:
      return <ContestantClarificationsPage />;
    default:
      return <SpectatorClarificationsPage />;
  }
}
