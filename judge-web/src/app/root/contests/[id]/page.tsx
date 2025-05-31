"use client";

import { use, useEffect } from "react";
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
import { useFindContestByIdForRoot } from "@/app/_action/find-contest-by-id-for-root-action";
import { useUpdateContestAction } from "@/app/_action/update-contest-action";

export default function RootEditContestPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { data: contest, ...findContestByIdAction } =
    useFindContestByIdForRoot();
  const updateContestAction = useUpdateContestAction();

  const form = useForm<ContestFormType>({
    resolver: joiResolver(contestFormSchema),
    defaultValues: {
      problems: [],
      members: [],
    },
  });

  useEffect(() => {
    async function findContest() {
      const contest = await findContestByIdAction.act(id);
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
      contestId={contest?.id}
      header={`Contest #${contest?.id || ""}`}
      status={contest?.status}
      onSubmit={updateContest}
      form={form}
      isDisabled={
        findContestByIdAction.isLoading ||
        updateContestAction.isLoading ||
        contest?.status !== ContestStatus.NOT_STARTED
      }
      isLoading={findContestByIdAction.isLoading}
    />
  );
}
