"use client";

import { redirect } from "next/navigation";

import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useAuthorization } from "@/store/slices/authorization-slice";

/**
 * ContestPage component that redirects users based on their member type.
 */
export default function ContestPage() {
  const authorization = useAuthorization();
  const contest = useContestMetadata();

  switch (authorization?.member.type) {
    case MemberType.CONTESTANT:
      return redirect(routes.CONTEST_CONTESTANT(contest.slug));
    case MemberType.JUDGE:
      return redirect(routes.CONTEST_JUDGE(contest.slug));
    default:
      return redirect(routes.CONTEST_GUEST(contest.slug));
  }
}
