"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import { redirect } from "next/navigation";
import { use, useEffect } from "react";
import { useForm } from "react-hook-form";
import { defineMessages } from "react-intl";

import { ContestForm } from "@/app/root/(dashboard)/contests/_component/contest-form";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form";
import { ContestFormMap } from "@/app/root/(dashboard)/contests/_form/contest-form-map";
import { contestFormSchema } from "@/app/root/(dashboard)/contests/_form/contest-form-schema";
import { contestService } from "@/config/composition";
import { routes } from "@/config/routes";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { useLoadableState } from "@/lib/util/loadable-state";
import { TestCaseValidator } from "@/lib/util/test-case-validator";
import { useAlert } from "@/store/slices/alerts-slice";

const messages = defineMessages({
  loadError: {
    id: "app.root.(dashboard).contests.[id].page.load-error",
    defaultMessage: "Error loading contest data",
  },
  testCasesValidationError: {
    id: "app.root.(dashboard).contests.[id].page.test-cases-validation-error",
    defaultMessage:
      "Test cases file must have exactly two columns and at least one row. Failed problems: {letters}",
  },
  updateSuccess: {
    id: "app.root.(dashboard).contests.[id].page.update-success",
    defaultMessage: "Contest updated successfully",
  },
  updateError: {
    id: "app.root.(dashboard).contests.[id].page.update-error",
    defaultMessage: "Error updating contest data",
  },
});

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
          default: () => alert.error(messages.loadError),
        });
      }
    }

    findContest();
  }, []);

  async function updateContest(data: ContestFormType) {
    updateContestState.start();
    try {
      const input = ContestFormMap.toUpdateRequestDTO(data);
      const failedValidations = await TestCaseValidator.validateProblemList(
        input.problems,
      );
      if (failedValidations.length > 0) {
        alert.warning({
          ...messages.testCasesValidationError,
          values: { letters: failedValidations.join(", ") },
        });
        return;
      }
      const contest = await contestService.updateContest(input);
      form.reset(ContestFormMap.fromResponseDTO(contest));
      updateContestState.finish(contest);
      alert.success(messages.updateSuccess);
    } catch (error) {
      updateContestState.fail(error, {
        [UnauthorizedException.name]: () => redirect(routes.ROOT_SIGN_IN),
        [NotFoundException.name]: () => redirect(routes.FORBIDDEN),
        default: () => alert.error(messages.updateError),
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
