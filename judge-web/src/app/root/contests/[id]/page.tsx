"use client";

import { use, useEffect } from "react";
import { useAtomValue } from "jotai";
import { containerAtom } from "@/app/_atom/container-atom";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/ContestFullResponseDTO";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { redirect } from "next/navigation";
import { useToast } from "@/app/_util/toast-hook";

export default function RootContestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { contestService } = useAtomValue(containerAtom);
  const toast = useToast();
  const { id } = use(params);

  const contestFetcher = useFetcher<ContestFullResponseDTO>();

  useEffect(() => {
    const fetchContest = async () => {
      try {
        await contestFetcher.fetch(() =>
          contestService.findFullContestById(parseInt(id)),
        );
      } catch (error) {
        if (
          error instanceof UnauthorizedException ||
          error instanceof ForbiddenException
        ) {
          redirect("/root/auth");
        } else {
          toast.error();
        }
      }
    };
    fetchContest().then();
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <h1 className="text-uppercase">Contest</h1>
    </div>
  );
}
