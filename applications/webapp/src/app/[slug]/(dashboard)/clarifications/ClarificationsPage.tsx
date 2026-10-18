import { AdminClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/AdminClarificationsPage";
import { ContestantClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/ContestantClarificationsPage";
import { GuestClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/GuestClarificationsPage";
import { JudgeClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/JudgeClarificationsPage";
import { StaffClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/StaffClarificationsPage";
import { useAppSelector } from "@/app/_lib/store/Store";
import { MemberType } from "@/domain/enumerate/MemberType";

/**
 * Page displaying clarifications for the contest.
 */
export default function ClarificationsPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminClarificationsPage />;
    case MemberType.JUDGE:
      return <JudgeClarificationsPage />;
    case MemberType.STAFF:
      return <StaffClarificationsPage />;
    case MemberType.CONTESTANT:
      return <ContestantClarificationsPage />;
    default:
      return <GuestClarificationsPage />;
  }
}
