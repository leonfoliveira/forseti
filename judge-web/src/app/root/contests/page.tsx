"use client";

import { useContainer } from "@/app/_atom/container-atom";
import { redirect, useRouter } from "next/navigation";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { useEffect } from "react";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { Spinner } from "@/app/_component/spinner";
import { Button } from "@/app/_component/form/button";
import { ContestsTable } from "@/app/root/contests/_component/contests-table";

export default function RootContestsPage() {
  const { authorizationService, contestService } = useContainer();
  const contestsFetcher = useFetcher<ContestShortResponseDTO[]>();
  const router = useRouter();

  useEffect(() => {
    contestsFetcher.fetch(() => contestService.findAllContests(), {
      authRedirect: "/auth/root",
      errors: {
        [Error.name]: "Error fetching contests",
      },
    });
  }, []);

  if (!authorizationService.isAuthorized()) {
    redirect("/auth/root");
  }

  function onNewContest() {
    router.push("/root/contests/new");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center">
          <h1 className="text-2xl inline-block mr-3">Contests</h1>
          {contestsFetcher.isLoading && <Spinner />}
        </div>
        <Button type="button" onClick={onNewContest}>
          New
        </Button>
      </div>
      <ContestsTable contestsFetcher={contestsFetcher} />
    </div>
  );
}
