"use client";

import { ContestForm } from "@/app/root/(dashboard)/contests/_component/contest-form";
import { useForm } from "react-hook-form";
import { toCreateContestRequestDTO } from "@/app/root/(dashboard)/contests/_form/contest-form-map";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { contestFormSchema } from "@/app/root/(dashboard)/contests/_form/contest-form-schema";
import { useTranslations } from "next-intl";
import { useLoadableState } from "@/app/_util/loadable-state";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { contestService } from "@/app/_composition";
import { handleError } from "@/app/_util/error-handler";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { redirect, useRouter } from "next/navigation";
import { routes } from "@/app/_routes";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { useAlert } from "@/app/_component/context/notification-context";

export default function RootNewContestPage() {
  const createContestState =
    useLoadableState<WithStatus<ContestFullResponseDTO>>();

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
      const input = toCreateContestRequestDTO(data);
      const contest = await contestService.createContest(input);
      alert.success(t("create-success"));
      router.push(routes.ROOT_CONTESTS_EDIT(contest.id));
    } catch (error) {
      createContestState.fail(error);
      handleError(error, {
        [UnauthorizedException.name]: () => redirect(routes.ROOT_SIGN_IN),
        [NotFoundException.name]: () => redirect(routes.FORBIDDEN),
        default: () => alert.error(t("create-error")),
      });
    }
  }

  return (
    <ContestForm
      header={t("header")}
      onSubmit={createContest}
      form={form}
      isDisabled={createContestState.isLoading}
      isLoading={createContestState.isLoading}
      saveState={createContestState}
    />
  );
}
