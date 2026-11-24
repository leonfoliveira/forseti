import { useAppSelector } from "@/app/_lib/store/Store";
import { AdminProblemsPage } from "@/app/[slug]/(dashboard)/problems/AdminProblemsPage";
import { ContestantProblemsPage } from "@/app/[slug]/(dashboard)/problems/ContestantProblemsPage";
import { JudgeProblemsPage } from "@/app/[slug]/(dashboard)/problems/JudgeProblemsPage";
import { SpectatorProblemsPage } from "@/app/[slug]/(dashboard)/problems/SpectatorProblemsPage";
import { StaffProblemsPage } from "@/app/[slug]/(dashboard)/problems/StaffProblemsPage";
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
    case MemberType.UNOFFICIAL_CONTESTANT:
      return <ContestantProblemsPage />;
    default:
      return <SpectatorProblemsPage />;
  }
}
