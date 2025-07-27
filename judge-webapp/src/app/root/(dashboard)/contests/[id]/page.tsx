"use client";

import { use, useEffect } from "react";
import { ContestForm } from "@/app/root/(dashboard)/contests/_component/contest-form";
import { ContestFormMap } from "@/app/root/(dashboard)/contests/_form/contest-form-map";
import { useForm } from "react-hook-form";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form.type";
import { joiResolver } from "@hookform/resolvers/joi";
import { contestFormSchema } from "@/app/root/(dashboard)/contests/_form/contest-form-schema";
import { useTranslations } from "next-intl";
import { useLoadableState } from "@/app/_util/loadable-state";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { contestService } from "@/config/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { useAlert } from "@/app/_context/notification-context";
import { TestCaseUtils } from "@/app/root/(dashboard)/contests/_util/TestCaseUtils";

/**
 * RootEditContestPage component is used to edit a contest.
 */
export default function RootEditContestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contestState = useLoadableState<ContestFullResponseDTO>({
    isLoading: true,
  });
  const updateContestState = useLoadableState<ContestFullResponseDTO>();

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
        form.reset(ContestFormMap.fromResponseDTO(contest));
        contestState.finish(contest);
      } catch (error) {
        contestState.fail(error, {
          default: () => alert.error(t("load-error")),
        });
      }
    }

    findContest();
  }, []);

  async function updateContest(data: ContestFormType) {
    updateContestState.start();
    try {
      const input = ContestFormMap.toUpdateRequestDTO(data);
      const failedValidations = await TestCaseUtils.validateProblemList(
        input.problems,
      );
      if (failedValidations.length > 0) {
        alert.warning(
          t("test-cases-validation-error", {
            letters: failedValidations.join(", "),
          }),
        );
        return;
      }
      const contest = await contestService.updateContest(input);
      form.reset(ContestFormMap.fromResponseDTO(contest));
      updateContestState.finish(contest);
      alert.success(t("update-success"));
    } catch (error) {
      updateContestState.fail(error, {
        [UnauthorizedException.name]: () => redirect(routes.ROOT_SIGN_IN()),
        [NotFoundException.name]: () => redirect(routes.FORBIDDEN),
        default: () => alert.error(t("update-error")),
      });
    }
  }

  return (
    <ContestForm
      contestState={contestState}
      saveState={updateContestState}
      onSubmit={updateContest}
      form={form}
    />
  );
}
