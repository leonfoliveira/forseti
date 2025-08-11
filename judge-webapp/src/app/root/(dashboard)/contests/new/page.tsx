"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { defineMessages } from "react-intl";

import { useLoadableState } from "@/app/_util/loadable-state";
import { ContestForm } from "@/app/root/(dashboard)/contests/_component/contest-form";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form";
import { ContestFormMap } from "@/app/root/(dashboard)/contests/_form/contest-form-map";
import { contestFormSchema } from "@/app/root/(dashboard)/contests/_form/contest-form-schema";
import { contestService } from "@/config/composition";
import { routes } from "@/config/routes";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { useAlert } from "@/store/slices/alerts-slice";


const messages = defineMessages({
  createSuccess: {
    id: "app.root.(dashboard).contests.new.page.create-success",
    defaultMessage: "Contest created successfully",
  },
  createError: {
    id: "app.root.(dashboard).contests.new.page.create-error",
    defaultMessage: "Error creating contest",
  },
});

export default function RootNewContestPage() {
  const createContestState = useLoadableState<ContestFullResponseDTO>();

  const alert = useAlert();
  const router = useRouter();

  const form = useForm<ContestFormType>({
    resolver: joiResolver(contestFormSchema),
    defaultValues: {
      problems: [],
      members: [],
    },
  });

  async function createContest(data: ContestFormType) {
    createContestState.start();
    try {
      const input = ContestFormMap.toCreateRequestDTO(data);
      const contest = await contestService.createContest(input);
      alert.success(messages.createSuccess);
      router.push(routes.ROOT_CONTESTS_EDIT(contest.id));
    } catch (error) {
      createContestState.fail(error, {
        default: () => alert.error(messages.createError),
      });
    }
  }

  return (
    <ContestForm
      saveState={createContestState}
      onSubmit={createContest}
      form={form}
    />
  );
}
