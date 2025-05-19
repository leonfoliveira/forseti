"use client";

import { useContainer } from "@/app/_atom/container-atom";
import { use, useEffect } from "react";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { redirect } from "next/navigation";
import { useToast } from "@/app/_util/toast-hook";
import { useForm } from "react-hook-form";
import {
  ContestForm,
  ContestFormType,
} from "@/app/root/contests/_component/contest-form";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import {
  fromResponseDTO,
  toUpdateRequestDTO,
} from "@/app/root/contests/_util/contest-form-util";

export default function RootEditContestPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { attachmentService, contestService } = useContainer();
  const findContestFetcher = useFetcher();
  const updateContestFetcher = useFetcher();
  const toast = useToast();

  const form = useForm<ContestFormType>();

  useEffect(() => {
    async function findContest() {
      try {
        const contest = (await findContestFetcher.fetch(() =>
          contestService.findFullContestById(id),
        )) as ContestResponseDTO;
        form.reset(fromResponseDTO(contest));
      } catch (error) {
        if (
          error instanceof UnauthorizedException ||
          error instanceof ForbiddenException
        ) {
          redirect("/root/sign-in");
        } else {
          toast.error("Error fetching contest data");
        }
      }
    }
    findContest();
  }, []);

  async function updateContest(data: ContestFormType) {
    try {
      const inputDTO = await toUpdateRequestDTO(attachmentService, data);
      await updateContestFetcher.fetch(() =>
        contestService.updateContest(inputDTO as UpdateContestRequestDTO),
      );
      toast.success("Contest updated successfully");
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof Error) {
        redirect("/root/sign-in");
      } else {
        toast.error("Error updating contest");
      }
    }
  }

  return (
    <ContestForm
      onSubmit={updateContest}
      form={form}
      isDisabled={
        findContestFetcher.isLoading || updateContestFetcher.isLoading
      }
    />
  );
}
