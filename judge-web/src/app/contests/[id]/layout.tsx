"use client";

import React, { use, useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { toLocaleString } from "@/app/_util/date-utils";
import { ContestStatus } from "@/app/_util/contest-utils";
import { Navbar } from "@/app/_component/navbar";
import { usePathname, useRouter } from "next/navigation";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useSubscribeForMemberSubmissionAction } from "@/app/_action/subscribe-for-member-submission-action";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { useFindContestSummaryByIdAction } from "@/app/_action/find-contest-summary-action";
import { cls } from "@/app/_util/cls";

export default function ContestLayout({
  params,
  children,
}: {
  params: Promise<{ id: number }>;
  children: React.ReactNode;
}) {
  const { id } = use(params);
  const { data: contest, ...findContestAction } =
    useFindContestSummaryByIdAction();
  const subscribeForMemberSubmissionAction =
    useSubscribeForMemberSubmissionAction();
  const router = useRouter();
  const pathname = usePathname();
  const authorization = useAuthorization();

  useEffect(() => {
    findContestAction.act(id);
  }, []);

  useEffect(() => {
    if (authorization?.member.type === MemberType.CONTESTANT) {
      subscribeForMemberSubmissionAction.act(authorization.member.id);
    }
  }, [authorization]);

  if (findContestAction.isLoading || !contest) {
    return (
      <div className="h-dvh flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (contest.status === ContestStatus.NOT_STARTED) {
    return (
      <div className="h-dvh flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-4xl mb-5">{contest.title}</h1>
          <p className="font-semibold">Starts at</p>
          <p>{toLocaleString(contest.startAt as string)}</p>
        </div>
      </div>
    );
  }

  function buildNavLink(label: string, path: string) {
    const isActive = pathname === `/contests/${id}/${path}`;
    return (
      <a
        key={path}
        className={cls("tab", isActive && "tab-active")}
        onClick={() => router.push(`/contests/${id}/${path}`)}
      >
        {label}
      </a>
    );
  }

  function buildBuildNavLinks() {
    if (authorization?.member.type === MemberType.CONTESTANT) {
      return [
        buildNavLink("Leaderboard", "leaderboard"),
        buildNavLink("Problems", "problems"),
        buildNavLink("Submissions", "submissions"),
        buildNavLink("Timeline", "timeline"),
      ];
    }

    return [
      buildNavLink("Leaderboard", "leaderboard"),
      buildNavLink("Problems", "problems"),
      buildNavLink("Timeline", "timeline"),
    ];
  }

  return (
    <div>
      <Navbar contest={contest} signInPath={`/auth/contests/${id}`} />
      <div className="mt-2">
        <nav className="tabs tabs-lift w-full">{buildBuildNavLinks()}</nav>
        <div className="p-5 bg-base-100">{children}</div>
      </div>
    </div>
  );
}
