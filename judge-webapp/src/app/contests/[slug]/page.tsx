"use client";

import { redirect } from "next/navigation";
import { routes } from "@/routes";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { ContestMemberType } from "@/core/domain/enumerate/ContestMemberType";

/**
 * ContestPage component that redirects users based on their member type.
 */
export default function ContestPage() {
  const contest = useContestMetadata();

  switch (contest.loggedMemberType) {
    case ContestMemberType.CONTESTANT:
      return redirect(routes.CONTEST_CONTESTANT(contest.slug));
    case ContestMemberType.JURY:
      return redirect(routes.CONTEST_JURY(contest.slug));
    default:
      return redirect(routes.CONTEST_GUEST(contest.slug));
  }
}
