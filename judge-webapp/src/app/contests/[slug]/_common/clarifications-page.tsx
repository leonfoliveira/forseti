import { faPaperPlane, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { joiResolver } from "@hookform/resolvers/joi";
import React from "react";
import { useForm } from "react-hook-form";
import { defineMessages, FormattedMessage } from "react-intl";

import { useLoadableState } from "@/app/_util/loadable-state";
import { useModal } from "@/app/_util/modal-hook";
import { ClarificationFormType } from "@/app/contests/[slug]/_common/_form/clarification-form";
import { ClarificationFormMap } from "@/app/contests/[slug]/_common/_form/clarification-form-map";
import { clarificationFormSchema } from "@/app/contests/[slug]/_common/_form/clarification-form-schema";
import { clarificationService, contestService } from "@/config/composition";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { Button } from "@/lib/component/form/button";
import { Form } from "@/lib/component/form/form";
import { Select } from "@/lib/component/form/select";
import { TextInput } from "@/lib/component/form/text-input";
import { FormattedDateTime } from "@/lib/component/format/formatted-datetime";
import { DialogModal } from "@/lib/component/modal/dialog-modal";
import { useAlert } from "@/store/slices/alerts-slice";

const messages = defineMessages({
  createSuccess: {
    id: "app.contests.[slug]._common.clarifications-page.create-success",
    defaultMessage: "Clarification created successfully",
  },
  createError: {
    id: "app.contests.[slug]._common.clarifications-page.create-error",
    defaultMessage: "Failed to create clarification",
  },
  deleteSuccess: {
    id: "app.contests.[slug]._common.clarifications-page.delete-success",
    defaultMessage: "Clarification deleted successfully",
  },
  deleteError: {
    id: "app.contests.[slug]._common.clarifications-page.delete-error",
    defaultMessage: "Failed to delete clarification",
  },
  textLabel: {
    id: "app.contests.[slug]._common.clarifications-page.text-label",
    defaultMessage: "Text",
  },
  problemLabel: {
    id: "app.contests.[slug]._common.clarifications-page.problem-label",
    defaultMessage: "Problem",
  },
  problemOption: {
    id: "app.contests.[slug]._common.clarifications-page.problem-option",
    defaultMessage: "{letter}: {title}",
  },
  submitLabel: {
    id: "app.contests.[slug]._common.clarifications-page.submit-label",
    defaultMessage: "Submit",
  },
  empty: {
    id: "app.contests.[slug]._common.clarifications-page.empty",
    defaultMessage: "No clarifications yet",
  },
  headerProblem: {
    id: "app.contests.[slug]._common.clarifications-page.header-problem",
    defaultMessage: "{contestant} | Problem {letter}",
  },
  headerGeneral: {
    id: "app.contests.[slug]._common.clarifications-page.header-general",
    defaultMessage: "{contestant} | General",
  },
  answerLabel: {
    id: "app.contests.[slug]._common.clarifications-page.answer-label",
    defaultMessage: "Answer",
  },
  headerAnswer: {
    id: "app.contests.[slug]._common.clarifications-page.header-answer",
    defaultMessage: "RE: {judge}",
  },
  deleteConfirmLabel: {
    id: "app.contests.[slug]._common.clarifications-page.delete-confirm-label",
    defaultMessage: "Are you sure you want to delete this clarification?",
  },
});

type Props = {
  contestId: string;
  problems: ProblemPublicResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  canCreate?: boolean;
  canAnswer?: boolean;
};

export function ClarificationsPage({
  contestId,
  problems,
  clarifications,
  canCreate = false,
  canAnswer = false,
}: Props) {
  const alert = useAlert();
  const createClarificationState = useLoadableState();
  const deleteClarificationState = useLoadableState();

  const deleteModal = useModal<string>();
  const answerModal = useModal();
  const form = useForm<ClarificationFormType>({
    resolver: joiResolver(clarificationFormSchema),
  });
  const answerForm = useForm<ClarificationFormType>({
    resolver: joiResolver(clarificationFormSchema),
  });

  async function createClarification(data: ClarificationFormType) {
    createClarificationState.start();
    try {
      await contestService.createClarification(
        contestId,
        ClarificationFormMap.toInputDTO(data),
      );
      createClarificationState.finish();
      answerModal.close();
      form.reset();
      alert.success(messages.createSuccess);
    } catch (error) {
      createClarificationState.fail(error, {
        default: () => alert.error(messages.createError),
      });
    }
  }

  async function deleteClarification(id: string) {
    deleteClarificationState.start();
    try {
      await clarificationService.deleteById(id);
      deleteClarificationState.finish();
      deleteModal.close();
      alert.success(messages.deleteSuccess);
    } catch (error) {
      deleteClarificationState.fail(error, {
        default: () => alert.error(messages.deleteError),
      });
    }
  }

  return (
    <>
      {canCreate && (
        <Form
          className="flex flex-col"
          onSubmit={form.handleSubmit(createClarification)}
          disabled={createClarificationState.isLoading}
          data-testid="create-form"
        >
          <div className="flex gap-x-3">
            <Select
              form={form}
              name="problemId"
              label={messages.problemLabel}
              options={problems.map((it) => ({
                value: it.id,
                label: {
                  ...messages.problemOption,
                  values: { letter: it.letter, title: it.title },
                },
              }))}
              containerClassName="flex-1"
              data-testid="form-problem"
            />
            <TextInput
              form={form}
              label={messages.textLabel}
              name="text"
              containerClassName="flex-4"
              data-testid="form-text"
            />
          </div>
          <div className="flex justify-center mt-8">
            <Button
              type="submit"
              label={messages.submitLabel}
              rightIcon={<FontAwesomeIcon icon={faPaperPlane} />}
              className="btn-primary"
              isLoading={createClarificationState.isLoading}
              data-testid="form-submit"
            />
          </div>
          <div className="divider" />
        </Form>
      )}
      {clarifications.length == 0 && (
        <div
          className="flex justify-center items-center py-20"
          data-testid="empty"
        >
          <p className="text-neutral-content">
            <FormattedMessage {...messages.empty} />
          </p>
        </div>
      )}
      <div className="flex flex-col gap-y-8">
        {clarifications.toReversed().map((clarification) => (
          <div
            key={clarification.id}
            className="card bg-base-100 border border-base-300"
            data-testid="clarification"
          >
            <div className="card-body p-4 relative">
              <div className="flex justify-between">
                <p
                  className="text-sm font-semibold"
                  data-testid="clarification-problem"
                >
                  {clarification.problem?.id ? (
                    <FormattedMessage
                      {...messages.headerProblem}
                      values={{
                        contestant: clarification.member.name,
                        letter: clarification.problem.letter,
                      }}
                    />
                  ) : (
                    <FormattedMessage
                      {...messages.headerGeneral}
                      values={{
                        contestant: clarification.member.name,
                      }}
                    />
                  )}
                </p>
                <div className="flex">
                  <span
                    className="text-sm text-base-content/50"
                    data-testid="clarification-timestamp"
                  >
                    <FormattedDateTime timestamp={clarification.createdAt} />
                  </span>
                  {canAnswer && (
                    <Button
                      className="btn-soft btn-error ml-3"
                      leftIcon={<FontAwesomeIcon icon={faTrash} />}
                      onClick={() => deleteModal.open(clarification.id)}
                      data-testid="clarification-delete"
                    />
                  )}
                </div>
              </div>
              <p data-testid="clarification-text">{clarification.text}</p>
              {canAnswer && clarification.children.length == 0 && (
                <div className="flex justify-center absolute bottom-0 w-full translate-y-1/2">
                  <button
                    className="btn badge badge-soft badge-primary"
                    onClick={() => {
                      answerForm.reset({
                        text: "",
                        parentId: clarification.id,
                      });
                      answerModal.open();
                    }}
                    data-testid="clarification-answer"
                  >
                    <FormattedMessage {...messages.answerLabel} />
                  </button>
                </div>
              )}
            </div>
            {clarification.children.length > 0 && (
              <>
                <div className="divider m-0" />
                <div className="card-body p-4">
                  <div className="flex justify-between">
                    <p
                      className="text-sm font-semibold"
                      data-testid="clarification-answer-header"
                    >
                      <FormattedMessage
                        {...messages.headerAnswer}
                        values={{
                          contestant: clarification.children[0].member.name,
                        }}
                      />
                    </p>
                    <span
                      className="text-sm text-base-content/50"
                      data-testid="clarification-answer-timestamp"
                    >
                      <FormattedDateTime
                        timestamp={clarification.children[0].createdAt}
                      />
                    </span>
                  </div>
                  <p data-testid="clarification-answer-text">
                    {clarification.children[0].text}
                  </p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <DialogModal
        modal={deleteModal}
        onConfirm={deleteClarification}
        isLoading={deleteClarificationState.isLoading}
      >
        <p>
          <FormattedMessage {...messages.deleteConfirmLabel} />
        </p>
      </DialogModal>

      <DialogModal
        modal={answerModal}
        onConfirm={() => answerForm.handleSubmit(createClarification)()}
        isLoading={createClarificationState.isLoading}
      >
        <Form onSubmit={() => answerForm.handleSubmit(createClarification)()}>
          <TextInput
            form={answerForm}
            name="text"
            label={messages.textLabel}
            data-testid="form-answer-text"
          />
        </Form>
      </DialogModal>
    </>
  );
}
