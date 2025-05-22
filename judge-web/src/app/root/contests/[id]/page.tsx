"use client";

import { useContainer } from "@/app/_atom/container-atom";
import { use, useEffect } from "react";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { redirect, useRouter } from "next/navigation";
import { useToast } from "@/app/_util/toast-hook";
import { ContestForm } from "@/app/root/contests/_component/contest-form";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import {
  fromResponseDTO,
  toUpdateRequestDTO,
} from "@/app/root/contests/_form/contest-form-map";
import { useForm } from "react-hook-form";
import { ContestFormType } from "@/app/root/contests/_form/contest-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { contestFormSchema } from "@/app/root/contests/_form/contest-form-schema";
import { ServerException } from "@/core/domain/exception/ServerException";
import { DownloadAttachmentResponseDTO } from "@/core/repository/dto/response/DownloadAttachmentResponseDTO";

export default function RootEditContestPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { attachmentService, contestService } = useContainer();
  const findContestFetcher = useFetcher<ContestResponseDTO>();
  const updateContestFetcher = useFetcher<ContestResponseDTO>();
  const toast = useToast();
  const router = useRouter();

  const form = useForm<ContestFormType>({
    resolver: joiResolver(contestFormSchema),
    defaultValues: {
      problems: [],
      members: [],
    },
  });

  useEffect(() => {
    async function findContest() {
      const contest = await findContestFetcher.fetch(
        () => contestService.findFullContestById(id),
        {
          authRedirect: "/auth/root",
          errors: {
            [ServerException.name]: "Error loading contest",
          },
        },
      );
      form.reset(fromResponseDTO(contest));
    }
    findContest();
  }, []);

  async function updateContest(data: ContestFormType) {
    const inputDTO = await toUpdateRequestDTO(attachmentService, data);
    await updateContestFetcher.fetch(
      () => contestService.updateContest(inputDTO as UpdateContestRequestDTO),
      {
        authRedirect: "/auth/root",
        errors: {
          [ServerException.name]: "Error updating contest",
        },
      },
    );
    toast.success("Contest updated successfully");
  }

  return (
    <ContestForm
      header={`Contest ${findContestFetcher.data?.id || ""}`}
      onBack={() => router.push("/root/contests")}
      onSubmit={updateContest}
      onDownload={attachmentService.downloadAttachment}
      form={form}
      isDisabled={
        findContestFetcher.isLoading || updateContestFetcher.isLoading
      }
      isLoading={findContestFetcher.isLoading}
    />
  );
}
