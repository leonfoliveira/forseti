import { AdminAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/AdminAnnouncementsPage";
import { ContestantAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/ContestantAnnouncementsPage";
import { SpectatorAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/SpectatorAnnouncementsPage";
import { JudgeAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/JudgeAnnouncementsPage";
import { StaffAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/StaffAnnouncementsPage";
import { useAppSelector } from "@/app/_lib/store/Store";
import { MemberType } from "@/domain/enumerate/MemberType";

/**
 * Page displaying announcements for the contest.
 */
export default function AnnouncementsPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminAnnouncementsPage />;
    case MemberType.JUDGE:
      return <JudgeAnnouncementsPage />;
    case MemberType.STAFF:
      return <StaffAnnouncementsPage />;
    case MemberType.CONTESTANT:
      return <ContestantAnnouncementsPage />;
    default:
      return <SpectatorAnnouncementsPage />;
  }
}
