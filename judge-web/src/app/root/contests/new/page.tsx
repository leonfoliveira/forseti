"use client";

import { ContestForm } from "@/app/root/contests/_component/contest-form";
import { useContainer } from "@/app/_atom/container-atom";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { useForm } from "react-hook-form";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useToast } from "@/app/_util/toast-hook";
import { redirect, useRouter } from "next/navigation";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { toCreateContestRequestDTO } from "@/app/root/contests/_form/contest-form-map";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { ContestFormType } from "@/app/root/contests/_form/contest-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { contestFormSchema } from "@/app/root/contests/_form/contest-form-schema";
import { ServerException } from "@/core/domain/exception/ServerException";

export default function RootNewContestPage() {
  const { attachmentService, contestService } = useContainer();
  const toast = useToast();
  const createContestFetcher = useFetcher();
  const router = useRouter();

  const form = useForm<ContestFormType>({
    resolver: joiResolver(contestFormSchema),
    defaultValues: {
      problems: [],
      members: [],
    },
  });

  async function createContest(data: ContestFormType) {
    const inputDTO = await toCreateContestRequestDTO(attachmentService, data);
    const contest = (await createContestFetcher.fetch(
      () => contestService.createContest(inputDTO),
      {
        authRedirect: "/auth/root",
        errors: {
          [ServerException.name]: "Error creating contests",
        },
      },
    )) as ContestResponseDTO;
    toast.success("Contest created successfully");
    router.push(`/root/contests/${contest.id}`);
  }

  return (
    <ContestForm
      header="Create Contest"
      onBack={() => router.push("/root/contests")}
      onSubmit={createContest}
      form={form}
      isDisabled={createContestFetcher.isLoading}
      isLoading={createContestFetcher.isLoading}
    />
  );
}
