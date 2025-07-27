"use client";

import { ContestForm } from "@/app/root/(dashboard)/contests/_component/contest-form";
import { useForm } from "react-hook-form";
import { ContestFormMap } from "@/app/root/(dashboard)/contests/_form/contest-form-map";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form.type";
import { joiResolver } from "@hookform/resolvers/joi";
import { contestFormSchema } from "@/app/root/(dashboard)/contests/_form/contest-form-schema";
import { useTranslations } from "next-intl";
import { useLoadableState } from "@/app/_util/loadable-state";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { contestService } from "@/config/composition";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useAlert } from "@/app/_context/notification-context";

export default function RootNewContestPage() {
  const createContestState = useLoadableState<ContestFullResponseDTO>();

  const alert = useAlert();
  const router = useRouter();
  const t = useTranslations("root.contests.new");

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
      alert.success(t("create-success"));
      router.push(routes.ROOT_CONTESTS_EDIT(contest.id));
    } catch (error) {
      createContestState.fail(error, {
        default: () => alert.error(t("create-error")),
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
