"use client";

import { useContainer } from "@/app/_atom/container-atom";
import { redirect, useRouter } from "next/navigation";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { useEffect } from "react";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { ContestsDashboard } from "@/app/root/contests/_component/contests-dashboard.ts";

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
    <ContestsDashboard
      onNewContest={onNewContest}
      contestsFetcher={contestsFetcher}
    />
  );
}
