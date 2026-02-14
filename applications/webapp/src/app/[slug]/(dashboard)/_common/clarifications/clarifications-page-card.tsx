import { joiResolver } from "@hookform/resolvers/joi";
import {
  MessageCircleQuestionIcon,
  MessageCircleReplyIcon,
  SendIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  ClarificationAnswerForm,
  ClarificationAnswerFormType,
} from "@/app/[slug]/(dashboard)/_common/clarifications/clarification-answer-form";
import { ConfirmationDialog } from "@/app/_lib/component/feedback/confirmation-dialog";
import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { Form } from "@/app/_lib/component/form/form";
import { FormattedDateTime } from "@/app/_lib/component/i18n/formatted-datetime";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/app/_lib/component/shadcn/card";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { Textarea } from "@/app/_lib/component/shadcn/textarea";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { clarificationWritter } from "@/config/composition";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  headerProblem: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-card.header-problem",
    defaultMessage: "Problem {letter}",
  },
  messageLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-card.message-label",
    defaultMessage: "Message",
  },
  answerLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-card.answer-label",
    defaultMessage: "Answer",
  },
  createSuccess: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-card.create-success",
    defaultMessage: "Clarification answered successfully",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-card.create-error",
    defaultMessage: "Failed to answer clarification",
  },
  deleteAlertTitle: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-card.delete-alert-title",
    defaultMessage: "Are you absolutely sure?",
  },
  deleteAlertDescription: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-card.delete-alert-description",
    defaultMessage:
      "This action cannot be undone. This will permanently delete the clarification.",
  },
  deleteAlertCancel: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-card.delete-alert-cancel",
    defaultMessage: "Cancel",
  },
  deleteAlertContinue: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-card.delete-alert-continue",
    defaultMessage: "Continue",
  },
  deleteSuccess: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-card.delete-success",
    defaultMessage: "Clarification deleted successfully",
  },
  deleteError: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-card.delete-error",
    defaultMessage: "Failed to delete clarification",
  },
});

type Props = {
  contestId: string;
  clarification: ClarificationResponseDTO;
  canAnswer?: boolean;
};

export function ClarificationsPageCard({
  contestId,
  clarification,
  canAnswer,
}: Props) {
  const answerClarificationState = useLoadableState();
  const deleteClarificationState = useLoadableState();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const toast = useToast();

  const form = useForm<ClarificationAnswerFormType>({
    resolver: joiResolver(ClarificationAnswerForm.schema),
    defaultValues: ClarificationAnswerForm.getDefault(),
  });

  const answer =
    clarification.children.length > 0 ? clarification.children[0] : undefined;

  async function answerClarification(data: ClarificationAnswerFormType) {
    answerClarificationState.start();
    try {
      await clarificationWritter.create(contestId, {
        ...ClarificationAnswerForm.toInputDTO(data, clarification.id),
        parentId: clarification.id,
      });
      answerClarificationState.finish();
      form.reset();
      toast.success(messages.createSuccess);
    } catch (error) {
      await answerClarificationState.fail(error, {
        default: () => toast.error(messages.createError),
      });
    }
  }

  async function deleteClarification() {
    deleteClarificationState.start();
    try {
      await clarificationWritter.deleteById(contestId, clarification.id);
      deleteClarificationState.finish();
      setIsDeleteDialogOpen(false);
      toast.success(messages.deleteSuccess);
    } catch (error) {
      await deleteClarificationState.fail(error, {
        default: () => toast.error(messages.deleteError),
      });
    }
  }

  return (
    <Card
      className="border-l-4 border-l-blue-400"
      data-testid="clarification-card"
    >
      <CardContent>
        <div className="flex items-center gap-4">
          <MessageCircleQuestionIcon size={24} />
          <div className="w-full">
            <div className="flex justify-between">
              <p className="text-sm font-semibold">
                <span data-testid="clarification-member-name">
                  {clarification.member.name}
                </span>
                {clarification.problem && (
                  <Badge
                    className="ml-2"
                    variant="default"
                    data-testid="clarification-problem-title"
                  >
                    <FormattedMessage
                      {...messages.headerProblem}
                      values={{ letter: clarification.problem?.letter }}
                    />
                  </Badge>
                )}
              </p>
              {canAnswer && (
                <>
                  <Button
                    size="xs"
                    variant="destructive"
                    data-testid="clarification-delete-button"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <TrashIcon />
                  </Button>

                  <ConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    title={messages.deleteAlertTitle}
                    description={messages.deleteAlertDescription}
                    onCancel={() => setIsDeleteDialogOpen(false)}
                    onConfirm={deleteClarification}
                    isLoading={deleteClarificationState.isLoading}
                  />
                </>
              )}
            </div>
            <p
              className="text-default-400 text-xs"
              data-testid="clarification-created-at"
            >
              <FormattedDateTime timestamp={clarification.createdAt} />
            </p>
          </div>
        </div>
        <p className="mt-3" data-testid="clarification-text">
          {clarification.text}
        </p>
      </CardContent>
      {!!answer || canAnswer ? <Separator /> : null}
      {!!answer || canAnswer ? (
        <CardFooter>
          {!!answer && (
            <div className="ml-5" data-testid="clarification-answer-card">
              <div className="flex items-center gap-4">
                <MessageCircleReplyIcon size={24} />
                <div>
                  <p
                    className="text-sm font-semibold"
                    data-testid="clarification-answer-member-name"
                  >
                    {answer.member.name}
                  </p>
                  <p
                    className="text-default-400 text-xs"
                    data-testid="clarification-answer-created-at"
                  >
                    <FormattedDateTime timestamp={answer.createdAt} />
                  </p>
                </div>
              </div>
              <p className="mt-3" data-testid="clarification-answer-text">
                {answer.text}
              </p>
            </div>
          )}
          {!answer && (
            <div className="flex-1" data-testid="clarification-answer-form">
              <Form onSubmit={form.handleSubmit(answerClarification)}>
                <FieldSet disabled={answerClarificationState.isLoading}>
                  <div className="flex flex-col items-end gap-3">
                    <ControlledField
                      form={form}
                      name="text"
                      label={messages.answerLabel}
                      field={
                        <Textarea data-testid="clarification-answer-textarea" />
                      }
                    />
                    <AsyncButton
                      type="submit"
                      icon={<SendIcon size={16} />}
                      isLoading={answerClarificationState.isLoading}
                      data-testid="clarification-answer-submit-button"
                    >
                      <FormattedMessage {...messages.answerLabel} />
                    </AsyncButton>
                  </div>
                </FieldSet>
              </Form>
            </div>
          )}
        </CardFooter>
      ) : null}
    </Card>
  );
}
