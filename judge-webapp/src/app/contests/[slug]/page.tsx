"use client";

import { redirect } from "next/navigation";
import { routes } from "@/app/_routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";

export default function ContestPage() {
  const { authorization } = useAuthorization();
  const contest = useContestMetadata();

  switch (authorization?.member.type) {
    case MemberType.CONTESTANT:
      return redirect(routes.CONTEST_CONTESTANT(contest.slug));
    case MemberType.JURY:
      return redirect(routes.CONTEST_JURY(contest.slug));
    default:
      return redirect(routes.NOT_FOUND);
  }
}
