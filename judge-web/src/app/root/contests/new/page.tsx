"use client";

import {
  ContestForm,
  ContestFormType,
} from "@/app/root/contests/_component/contest-form";
import { useContainer } from "@/app/_atom/container-atom";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { useForm } from "react-hook-form";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useToast } from "@/app/_util/toast-hook";
import { redirect, useRouter } from "next/navigation";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { toCreateContestRequestDTO } from "@/app/root/contests/_util/contest-form-map";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { zodResolver } from "@hookform/resolvers/zod";
import { contestFormValidation } from "@/app/root/contests/_util/contest-form-validation";

export default function RootNewContestPage() {
  const { attachmentService, contestService } = useContainer();
  const toast = useToast();
  const createContestFetcher = useFetcher();
  const router = useRouter();

  const form = useForm<ContestFormType>({
    resolver: zodResolver(contestFormValidation),
    defaultValues: {
      languages: [],
      problems: [],
      members: [],
    },
  });

  async function createContest(data: ContestFormType) {
    try {
      const inputDTO = await toCreateContestRequestDTO(attachmentService, data);
      const contest = (await createContestFetcher.fetch(() =>
        contestService.createContest(inputDTO),
      )) as ContestResponseDTO;
      toast.success("Contest created successfully");
      router.push(`/root/contests/${contest.id}`);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        redirect("/root/sign-in");
      } else {
        toast.error("Error creating contest");
      }
    }
  }

  return (
    <ContestForm
      header="Create Contest"
      onSubmit={createContest}
      form={form}
      isDisabled={createContestFetcher.isLoading}
    />
  );
}
