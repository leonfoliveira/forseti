"use client";

import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { useAuthorization } from "@/app/_context/authorization-context";
import { MemberType } from "@/core/domain/enumerate/MemberType";

/**
 * ContestPage component that redirects users based on their member type.
 */
export default function ContestPage() {
  const { authorization } = useAuthorization();
  const contest = useContestMetadata();

  switch (authorization?.member.type) {
    case MemberType.CONTESTANT:
      return redirect(routes.CONTEST_CONTESTANT(contest.slug));
    case MemberType.JURY:
      return redirect(routes.CONTEST_JURY(contest.slug));
    default:
      return redirect(routes.CONTEST_GUEST(contest.slug));
  }
}
