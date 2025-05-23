"use client";

import { useContainer } from "@/app/_atom/container-atom";
import React, { use, useEffect } from "react";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { ServerException } from "@/core/domain/exception/ServerException";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { Spinner } from "@/app/_component/spinner";
import { toLocaleString } from "@/app/_util/date-utils";
import { ContestStatus, getContestStatus } from "@/app/_util/contest-utils";
import Template from "@/app/_component/template";

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

  useEffect(() => {
    async function findContest() {
      await findContestFetcher.fetch(() => contestService.findContestById(id), {
        authRedirect: `/auth/contests/${id}`,
        errors: {
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

  return (
    <Template contest={contest} signInPath={`/auth/contests/${id}`}>
      {children}
    </Template>
  );
}
