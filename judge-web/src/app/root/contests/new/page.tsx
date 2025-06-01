"use client";

import { ContestForm } from "@/app/root/contests/_component/contest-form";
import { useForm } from "react-hook-form";
import { toCreateContestRequestDTO } from "@/app/root/contests/_form/contest-form-map";
import { ContestFormType } from "@/app/root/contests/_form/contest-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { contestFormSchema } from "@/app/root/contests/_form/contest-form-schema";
import { useCreateContestAction } from "@/app/_action/create-contest-action";
import { useTranslations } from "next-intl";

export default function RootNewContestPage() {
  const createContestAction = useCreateContestAction();
  const t = useTranslations("root.contests.new");

  const form = useForm<ContestFormType>({
    resolver: joiResolver(contestFormSchema),
    defaultValues: {
      problems: [],
      members: [],
    },
  });

  async function createContest(data: ContestFormType) {
    const input = toCreateContestRequestDTO(data);
    await createContestAction.act(input);
  }

  return (
    <ContestForm
      header={t("header")}
      onSubmit={createContest}
      form={form}
      isDisabled={createContestAction.isLoading}
      isLoading={createContestAction.isLoading}
    />
  );
}
