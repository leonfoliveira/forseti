"use client";

import ContestantContestSubmissionPage from "@/app/contests/[slug]/(dashboard)/submissions/contestant-page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import JuryContestSubmissionPage from "@/app/contests/[slug]/(dashboard)/submissions/jury-page";
import { redirect } from "next/navigation";
import { useAuthorization } from "@/app/_context/authorization-context";
import { routes } from "@/app/_routes";

export default function ContestSubmissionPage() {
  const { authorization } = useAuthorization();

  switch (authorization?.member.type) {
    case MemberType.CONTESTANT:
      return <ContestantContestSubmissionPage />;
    case MemberType.JURY:
      return <JuryContestSubmissionPage />;
    default:
      redirect(routes.FORBIDDEN);
  }
}
