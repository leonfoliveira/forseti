"use client";

import { useContainer } from "@/app/_atom/container-atom";
import { redirect, useRouter } from "next/navigation";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { useEffect } from "react";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { ContestsDashboard } from "@/app/root/contests/_component/contests-dashboard.ts";
import { useToast } from "@/app/_util/toast-hook";

export default function RootContestsPage() {
  const { authorizationService, contestService } = useContainer();
  const contestsFetcher = useFetcher<ContestShortResponseDTO[]>();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    async function findAllContests() {
      try {
        await contestsFetcher.fetch(() => contestService.findAllContests());
      } catch (error) {
        if (
          error instanceof UnauthorizedException ||
          error instanceof ForbiddenException
        ) {
          redirect("/root/sign-in");
        } else {
          toast.error("Error fetching contests");
        }
      }
    }
    findAllContests();
  }, []);

  if (!authorizationService.isAuthorized()) {
    redirect("/root/sign-in");
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
