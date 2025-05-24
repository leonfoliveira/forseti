"use client";

import { useContainer } from "@/app/_atom/container-atom";
import React, { use, useEffect, useState } from "react";
import { Spinner } from "@/app/_component/spinner";
import { toLocaleString } from "@/app/_util/date-utils";
import { ContestStatus, getContestStatus } from "@/app/_util/contest-utils";
import { Navbar } from "@/app/_component/navbar";
import { useRouter } from "next/navigation";
import { AuthorizationMember } from "@/core/domain/model/Authorization";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useFindContestByIdAction } from "@/app/_action/find-contest-by-id-action";

export default function ContestLayout({
  params,
  children,
}: {
  params: Promise<{ id: number }>;
  children: React.ReactNode;
}) {
  const { id } = use(params);
  const { authorizationService } = useContainer();
  const { data: contest, ...findContestAction } = useFindContestByIdAction();
  const router = useRouter();
  const [member, setMember] = useState<AuthorizationMember | undefined>();

  useEffect(() => {
    setMember(authorizationService.getAuthorization()?.member);
    findContestAction.act(id);
  }, []);

  if (findContestAction.isLoading || !contest) {
    return (
      <div className="h-dvh flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const status = getContestStatus(contest);
  if (status === ContestStatus.NOT_STARTED) {
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
    return (
      <li
        className="p-2 flex-1 font-semibold hover:bg-gray-100 active:bg-gray-200 transition"
        onClick={() => router.push(`/contests/${id}/${path}`)}
      >
        {label}
      </li>
    );
  }

  function buildBuildNavLinks() {
    if (member?.type === MemberType.CONTESTANT) {
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
      <div className="mt-5 bg-white">
        <nav className="bg-gray-50">
          <ul className={`flex text-center cursor-pointer`}>
            {buildBuildNavLinks()}
          </ul>
        </nav>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
