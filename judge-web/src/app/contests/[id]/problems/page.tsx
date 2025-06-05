"use client";

import React, { use } from "react";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { ContestantContestProblemsPage } from "@/app/contests/[id]/problems/_contestant-page";
import { DefaultContestProblemsPage } from "@/app/contests/[id]/problems/_default-page";

export default function ContestProblemsPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const authorization = useAuthorization();

  const isContestant = authorization?.member.type === MemberType.CONTESTANT;

  if (isContestant) {
    return <ContestantContestProblemsPage contestId={id} />;
  } else {
    return <DefaultContestProblemsPage contestId={id} />;
  }
}
