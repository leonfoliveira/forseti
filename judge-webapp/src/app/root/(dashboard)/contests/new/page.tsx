"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { defineMessages, FormattedMessage } from "react-intl";

import { ContestForm } from "@/app/root/(dashboard)/contests/_component/contest-form";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form";
import { ContestFormMap } from "@/app/root/(dashboard)/contests/_form/contest-form-map";
import { contestFormSchema } from "@/app/root/(dashboard)/contests/_form/contest-form-schema";
import { contestService } from "@/config/composition";
import { routes } from "@/config/routes";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { DialogModal } from "@/lib/component/modal/dialog-modal";
import { useLoadableState } from "@/lib/util/loadable-state";
import { useModal } from "@/lib/util/modal-hook";
import { TestCaseValidator } from "@/lib/util/test-case-validator";
import { useAlert } from "@/store/slices/alerts-slice";

const messages = defineMessages({
  invalidTestCase: {
    id: "app.root.(dashboard).contests.new.page.invalid-test-case",
    defaultMessage: "Must have exactly two columns and at least one row",
  },
  createSuccess: {
    id: "app.root.(dashboard).contests.new.page.create-success",
    defaultMessage: "Contest created successfully",
  },
  createError: {
    id: "app.root.(dashboard).contests.new.page.create-error",
    defaultMessage: "Error creating contest",
  },
  confirmCreate: {
    id: "app.root.(dashboard).contests.new.page.confirm-create",
    defaultMessage: "Are you sure you want to create this contest?",
  },
});

export default function RootNewContestPage() {
  const createContestState = useLoadableState<ContestFullResponseDTO>();

  const alert = useAlert();
  const router = useRouter();
  const saveModal = useModal<ContestFormType>();

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

  async function onSubmit(data: ContestFormType) {
    const validations = await TestCaseValidator.validateProblemList(
      data.problems || [],
    );
    validations.forEach((it, idx) => {
      if (!it.isValid) {
        form.setError(`problems.${idx}.newTestCases`, {
          message: messages.invalidTestCase.id,
        });
      }
    });
    if (validations.find((it) => !it.isValid)) return;

    saveModal.open();
  }

  return (
    <>
      <ContestForm
        saveState={createContestState}
        onSubmit={onSubmit}
        form={form}
      />
      <DialogModal
        modal={saveModal}
        onConfirm={createContest}
        isLoading={createContestState.isLoading}
      >
        <p className="py-4">
          <FormattedMessage {...messages.confirmCreate} />
        </p>
      </DialogModal>
    </>
  );
}
