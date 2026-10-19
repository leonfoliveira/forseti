import { AdminProblemsPage } from "@/app/[slug]/(dashboard)/problems/AdminProblemsPage";
import { ContestantProblemsPage } from "@/app/[slug]/(dashboard)/problems/ContestantProblemsPage";
import { SpectatorProblemsPage } from "@/app/[slug]/(dashboard)/problems/SpectatorProblemsPage";
import { JudgeProblemsPage } from "@/app/[slug]/(dashboard)/problems/JudgeProblemsPage";
import { StaffProblemsPage } from "@/app/[slug]/(dashboard)/problems/StaffProblemsPage";
import { useAppSelector } from "@/app/_lib/store/Store";
import { MemberType } from "@/domain/enumerate/MemberType";

/**
 * Page displaying the problems for the contest.
 */
export default function ProblemsPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminProblemsPage />;
    case MemberType.JUDGE:
      return <JudgeProblemsPage />;
    case MemberType.STAFF:
      return <StaffProblemsPage />;
    case MemberType.CONTESTANT:
      return <ContestantProblemsPage />;
    default:
      return <SpectatorProblemsPage />;
  }
}
