"use client";

import { use, useEffect } from "react";
import { ContestForm } from "@/app/root/(dashboard)/contests/_component/contest-form";
import {
  fromResponseDTO,
  toUpdateRequestDTO,
} from "@/app/root/(dashboard)/contests/_form/contest-form-map";
import { useForm } from "react-hook-form";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { contestFormSchema } from "@/app/root/(dashboard)/contests/_form/contest-form-schema";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { useTranslations } from "next-intl";
import { useLoadableState } from "@/app/_util/loadable-state";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { contestService } from "@/app/_composition";
import { handleError } from "@/app/_util/error-handler";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { redirect } from "next/navigation";
import { routes } from "@/app/_routes";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { useAlert } from "@/app/_component/context/notification-context";

export default function RootEditContestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contestState = useLoadableState<WithStatus<ContestFullResponseDTO>>();
  const updateContestState =
    useLoadableState<WithStatus<ContestFullResponseDTO>>();

  const alert = useAlert();
  const t = useTranslations("root.contests.[id]");

  const form = useForm<ContestFormType>({
    resolver: joiResolver(contestFormSchema),
    defaultValues: {
      problems: [],
      members: [],
    },
  });

  useEffect(() => {
    async function findContest() {
      contestState.start();
      try {
        const contest = await contestService.findFullContestById(id);
        form.reset(fromResponseDTO(contest));
        contestState.finish(contest);
      } catch (error) {
        contestState.fail(error);
        handleError(error, {
          [UnauthorizedException.name]: () => redirect(routes.ROOT_SIGN_IN),
          [NotFoundException.name]: () => redirect(routes.FORBIDDEN),
          default: () => alert.error(t("load-error")),
        });
      }
    }
    findContest();
  }, []);

  async function updateContest(data: ContestFormType) {
    updateContestState.start();
    try {
      const input = toUpdateRequestDTO(data);
      const contest = await contestService.updateContest(input);
      form.reset(fromResponseDTO(contest));
      contestState.finish(contest);
    } catch (error) {
      updateContestState.fail(error);
      handleError(error, {
        [UnauthorizedException.name]: () => redirect(routes.ROOT_SIGN_IN),
        [NotFoundException.name]: () => redirect(routes.FORBIDDEN),
        default: () => alert.error(t("update-error")),
      });
    }
  }

  return (
    <ContestForm
      contestId={contestState.data?.id}
      header={t("header", { id: contestState.data?.id || "" })}
      contest={contestState.data}
      onSubmit={updateContest}
      form={form}
      isDisabled={
        contestState.isLoading ||
        updateContestState.isLoading ||
        contestState.data?.status !== ContestStatus.NOT_STARTED
      }
      isLoading={contestState.isLoading}
      saveState={updateContestState}
    />
  );
}
