"use client";

import { useContainer } from "@/app/_atom/container-atom";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContestForm } from "@/app/root/contests/_component/contest-form";
import {
  fromResponseDTO,
  toUpdateRequestDTO,
} from "@/app/root/contests/_form/contest-form-map";
import { useForm } from "react-hook-form";
import { ContestFormType } from "@/app/root/contests/_form/contest-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { contestFormSchema } from "@/app/root/contests/_form/contest-form-schema";
import { ContestStatus } from "@/app/_util/contest-utils";
import { useFindFullContestByIdAction } from "@/app/_action/find-full-contest-by-id-action";
import { useUpdateContestAction } from "@/app/_action/update-contest-action";

export default function RootEditContestPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { attachmentService } = useContainer();
  const { data: contest, ...findFullContestByIdAction } =
    useFindFullContestByIdAction();
  const updateContestAction = useUpdateContestAction();
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
      const contest = await findFullContestByIdAction.act(id);
      if (contest) {
        form.reset(fromResponseDTO(contest));
      }
    }
    findContest();
  }, []);

  async function updateContest(data: ContestFormType) {
    const input = toUpdateRequestDTO(data);
    const contest = await updateContestAction.act(input);
    if (contest) {
      form.reset(fromResponseDTO(contest));
    }
  }

  return (
    <ContestForm
      header={`Contest ${contest?.id || ""}`}
      status={contest?.status}
      onBack={() => router.push("/root/contests")}
      onSubmit={updateContest}
      onDownload={attachmentService.downloadAttachment}
      form={form}
      isDisabled={
        findFullContestByIdAction.isLoading ||
        updateContestAction.isLoading ||
        contest?.status !== ContestStatus.NOT_STARTED
      }
      isLoading={findFullContestByIdAction.isLoading}
    />
  );
}
