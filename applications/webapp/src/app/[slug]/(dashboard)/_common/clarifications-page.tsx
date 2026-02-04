import { TrashIcon } from "@heroicons/react/24/solid";
import { joiResolver } from "@hookform/resolvers/joi";
import React from "react";
import { useForm } from "react-hook-form";

import { ClarificationFormType } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form";
import { ClarificationFormMap } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form-map";
import { clarificationFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form-schema";
import { Card } from "@/app/_lib/component/base/display/card";
import { Button } from "@/app/_lib/component/base/form/button";
import { Form } from "@/app/_lib/component/base/form/form";
import { Input } from "@/app/_lib/component/base/form/input";
import { Select } from "@/app/_lib/component/base/form/select";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { FormattedDateTime } from "@/app/_lib/component/format/formatted-datetime";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { Metadata } from "@/app/_lib/component/metadata";
import { ConfirmationModal } from "@/app/_lib/component/modal/confirmation-modal";
import { useIntl } from "@/app/_lib/util/intl-hook";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useModal } from "@/app/_lib/util/modal-hook";
import { useToast } from "@/app/_lib/util/toast-hook";
import { clarificationWritter } from "@/config/composition";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages, Message } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.clarifications-page.page-title",
    defaultMessage: "Forseti - Clarifications",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.clarifications-page.page-description",
    defaultMessage: "View and request clarifications for contest problems.",
  },
  createTitle: {
    id: "app.[slug].(dashboard)._common.clarifications-page.create-title",
    defaultMessage: "Create Clarification",
  },
  createSuccess: {
    id: "app.[slug].(dashboard)._common.clarifications-page.create-success",
    defaultMessage: "Clarification created successfully",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.clarifications-page.create-error",
    defaultMessage: "Failed to create clarification",
  },
  deleteSuccess: {
    id: "app.[slug].(dashboard)._common.clarifications-page.delete-success",
    defaultMessage: "Clarification deleted successfully",
  },
  deleteError: {
    id: "app.[slug].(dashboard)._common.clarifications-page.delete-error",
    defaultMessage: "Failed to delete clarification",
  },
  textLabel: {
    id: "app.[slug].(dashboard)._common.clarifications-page.text-label",
    defaultMessage: "Text",
  },
  problemLabel: {
    id: "app.[slug].(dashboard)._common.clarifications-page.problem-label",
    defaultMessage: "Problem (optional)",
  },
  problemOption: {
    id: "app.[slug].(dashboard)._common.clarifications-page.problem-option",
    defaultMessage: "{letter}. {title}",
  },
  submitLabel: {
    id: "app.[slug].(dashboard)._common.clarifications-page.submit-label",
    defaultMessage: "Submit",
  },
  empty: {
    id: "app.[slug].(dashboard)._common.clarifications-page.empty",
    defaultMessage: "No clarifications yet",
  },
  headerProblem: {
    id: "app.[slug].(dashboard)._common.clarifications-page.header-problem",
    defaultMessage: "Problem {letter}",
  },
  headerGeneral: {
    id: "app.[slug].(dashboard)._common.clarifications-page.header-general",
    defaultMessage: "General",
  },
  answerLabel: {
    id: "app.[slug].(dashboard)._common.clarifications-page.answer-label",
    defaultMessage: "Answer",
  },
  headerAnswer: {
    id: "app.[slug].(dashboard)._common.clarifications-page.header-answer",
    defaultMessage: "Re: {judge}",
  },
  deleteTitle: {
    id: "app.[slug].(dashboard)._common.clarifications-page.delete-tooltip",
    defaultMessage: "Delete Clarification",
  },
  deleteConfirmLabel: {
    id: "app.[slug].(dashboard)._common.clarifications-page.delete-confirm-label",
    defaultMessage: "Are you sure you want to delete this clarification?",
  },
  deleteCancel: {
    id: "app.[slug].(dashboard)._common.clarifications-page.cancel-label",
    defaultMessage: "No, Cancel",
  },
  deleteConfirm: {
    id: "app.[slug].(dashboard)._common.clarifications-page.delete-confirm",
    defaultMessage: "Yes, Delete",
  },
});

type Props = {
  contestId: string;
  problems: ProblemPublicResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  canCreate?: boolean;
  canAnswer?: boolean;
};

/**
 * Displays the clarifications page where users can view, request, and answer clarifications for contest problems.
 **/
export function ClarificationsPage({
  contestId,
  problems,
  clarifications,
  canCreate = false,
  canAnswer = false,
}: Props) {
  const toast = useToast();
  const createState = useLoadableState();
  const deleteState = useLoadableState();
  const intl = useIntl();

  const deleteModal = useModal<string>();
  const form = useForm<ClarificationFormType>({
    resolver: joiResolver(clarificationFormSchema),
    defaultValues: ClarificationFormMap.getDefault(),
  });

  async function createClarification(data: ClarificationFormType) {
    createState.start();
    try {
      await clarificationWritter.create(
        contestId,
        ClarificationFormMap.toInputDTO(data),
      );
      createState.finish();
      form.reset();
      toast.success(messages.createSuccess);
    } catch (error) {
      createState.fail(error, {
        default: () => toast.error(messages.createError),
      });
    }
  }

  async function deleteClarification(id: string) {
    deleteState.start();
    try {
      await clarificationWritter.deleteById(contestId, id);
      deleteState.finish();
      deleteModal.close();
      toast.success(messages.deleteSuccess);
    } catch (error) {
      deleteState.fail(error, {
        default: () => toast.error(messages.deleteError),
      });
    }
  }

  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <div className="flex flex-col items-center">
        {/* Create Form */}
        {canCreate && (
          <>
            <Card className="max-w-4xl w-full mb-6" data-testid="create-form">
              <Card.Header>
                <h3
                  className="text-lg font-semibold"
                  data-testid="create-form-title"
                >
                  <FormattedMessage {...messages.createTitle} />
                </h3>
              </Card.Header>
              <Divider />
              <Card.Body>
                <form
                  onSubmit={form.handleSubmit(createClarification)}
                  className="space-y-4"
                >
                  <Form.Field form={form} name="problemId">
                    <Select
                      label={<FormattedMessage {...messages.problemLabel} />}
                      data-testid="create-form-problem"
                    >
                      {problems.map((problem) => (
                        <Select.Item key={problem.id}>
                          {intl.formatMessage({
                            ...messages.problemOption,
                            values: problem,
                          } as Message)}
                        </Select.Item>
                      ))}
                    </Select>
                  </Form.Field>
                  <Form.Field form={form} name="text">
                    <Input
                      label={<FormattedMessage {...messages.textLabel} />}
                      data-testid="create-form-text"
                    />
                  </Form.Field>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      color="primary"
                      isLoading={createState.isLoading}
                      data-testid="create-form-submit"
                    >
                      <FormattedMessage {...messages.submitLabel} />
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>
            <Divider className="mb-5" />
          </>
        )}

        {/* Empty State */}
        {clarifications.length == 0 && (
          <Card className="max-w-4xl w-full" data-testid="empty">
            <Card.Body>
              <p className="text-neutral-content text-center my-10 text-foreground-400">
                <FormattedMessage {...messages.empty} />
              </p>
            </Card.Body>
          </Card>
        )}

        {/* Items */}
        <div className="space-y-5 max-w-4xl w-full">
          {clarifications.toReversed().map((clarification) => (
            <Card
              key={clarification.id}
              className="max-w-4xl w-full"
              data-testid="clarification"
            >
              <Card.Body>
                <div className="w-full flex justify-between">
                  <div>
                    <p
                      className="font-semibold text-sm"
                      data-testid="clarification-member-name"
                    >
                      {clarification.member.name}
                    </p>
                    <p
                      className="text-xs text-foreground-400"
                      data-testid="clarification-problem"
                    >
                      {clarification.problem ? (
                        <FormattedMessage
                          {...messages.headerProblem}
                          values={{
                            letter: clarification.problem.letter,
                          }}
                        />
                      ) : (
                        <FormattedMessage {...messages.headerGeneral} />
                      )}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p
                      className="text-xs text-default-400"
                      data-testid="clarification-created-at"
                    >
                      <FormattedDateTime timestamp={clarification.createdAt} />
                    </p>
                    {canAnswer && (
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        size="sm"
                        onPress={() => deleteModal.open(clarification.id)}
                        className="lg:-col-end-1"
                        data-testid="delete-button"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-3" data-testid="clarification-text">
                  {clarification.text}
                </p>
              </Card.Body>
              {clarification.children.length === 0 && canAnswer && (
                <>
                  <Divider />
                  <Card.Footer>
                    <AnswerForm
                      contestId={contestId}
                      parentId={clarification.id}
                    />
                  </Card.Footer>
                </>
              )}
              {clarification.children.length > 0 && (
                <>
                  <Divider />
                  <Card.Footer>
                    <div className="w-full flex flex-col">
                      <div className="w-full flex justify-between">
                        <div>
                          <p
                            className="font-semibold text-sm"
                            data-testid="answer-member-name"
                          >
                            <FormattedMessage
                              {...messages.headerAnswer}
                              values={{
                                judge: clarification.children[0].member.name,
                              }}
                            />
                          </p>
                        </div>
                        <p
                          className="text-xs text-default-400"
                          data-testid="answer-created-at"
                        >
                          <FormattedDateTime
                            timestamp={clarification.children[0].createdAt}
                          />
                        </p>
                      </div>
                      <p className="mt-3" data-testid="answer-text">
                        {clarification.children[0].text}
                      </p>
                    </div>
                  </Card.Footer>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        isLoading={deleteState.isLoading}
        onClose={deleteModal.close}
        title={<FormattedMessage {...messages.deleteTitle} />}
        body={<FormattedMessage {...messages.deleteConfirmLabel} />}
        onConfirm={() => deleteClarification(deleteModal.props)}
        data-testid="delete-modal"
      />
    </>
  );
}

function AnswerForm({
  contestId,
  parentId,
}: {
  contestId: string;
  parentId: string;
}) {
  const createClarificationState = useLoadableState();
  const form = useForm<ClarificationFormType>({
    resolver: joiResolver(clarificationFormSchema),
    defaultValues: ClarificationFormMap.getDefault(),
  });
  const toast = useToast();

  async function createClarification(data: ClarificationFormType) {
    createClarificationState.start();
    try {
      await clarificationWritter.create(contestId, {
        ...ClarificationFormMap.toInputDTO(data),
        parentId,
      });
      createClarificationState.finish();
      form.reset();
      toast.success(messages.createSuccess);
    } catch (error) {
      createClarificationState.fail(error, {
        default: () => toast.error(messages.createError),
      });
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(createClarification)}
      className="w-full"
      data-testid="answer-form"
    >
      <div className="w-full flex">
        <Form.Field form={form} name="text">
          <Input data-testid="answer-form-text" />
        </Form.Field>
        <Button
          type="submit"
          color="primary"
          className="ml-2"
          isLoading={createClarificationState.isLoading}
          data-testid="answer-form-submit"
        >
          <FormattedMessage {...messages.answerLabel} />
        </Button>
      </div>
    </form>
  );
}
