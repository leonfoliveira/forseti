"use client";

import { useContainer } from "@/app/_atom/container-atom";
import React, { use, useEffect } from "react";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { ServerException } from "@/core/domain/exception/ServerException";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { Spinner } from "@/app/_component/spinner";
import { toLocaleString } from "@/app/_util/date-utils";
import { ContestStatus, getContestStatus } from "@/app/_util/contest-utils";
import { Navbar } from "@/app/_component/navbar";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { notFound, useRouter } from "next/navigation";

export default function ContestLayout({
  params,
  children,
}: {
  params: Promise<{ id: number }>;
  children: React.ReactNode;
}) {
  const { id } = use(params);
  const { contestService } = useContainer();
  const findContestFetcher = useFetcher<ContestShortResponseDTO>();
  const router = useRouter();

  useEffect(() => {
    async function findContest() {
      await findContestFetcher.fetch(() => contestService.findContestById(id), {
        errors: {
          [NotFoundException.name]: () => notFound(),
          [ServerException.name]: "Error loading contest",
        },
      });
    }
    findContest();
  }, []);

  const contest = findContestFetcher.data as ContestShortResponseDTO;
  if (findContestFetcher.isLoading || !contest) {
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
        className="p-2 font-semibold hover:bg-gray-100 active:bg-gray-200 transition"
        onClick={() => router.push(`/contests/${id}/${path}`)}
      >
        {label}
      </li>
    );
  }

  return (
    <div>
      <Navbar contest={contest} signInPath={`/auth/contests/${id}`} />
      <div className="mt-5 bg-white">
        <nav className="bg-gray-50">
          <ul className="grid [grid-template-columns:repeat(4,1fr)] text-center cursor-pointer">
            {buildNavLink("Leaderboard", "leaderboard")}
            {buildNavLink("Problems", "problems")}
            {buildNavLink("Submissions", "submissions")}
            {buildNavLink("Timeline", "timeline")}
          </ul>
        </nav>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
