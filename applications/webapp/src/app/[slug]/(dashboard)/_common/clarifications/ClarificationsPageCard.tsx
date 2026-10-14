import { joiResolver } from "@hookform/resolvers/joi";
import {
  MessageCircleQuestionIcon,
  MessageCircleReplyIcon,
  SendIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";

import {
  ClarificationAnswerForm,
  ClarificationAnswerFormType,
} from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationAnswerForm";
import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
import { ControlledField } from "@/app/_lib/component/form/ControlledField";
import { Form } from "@/app/_lib/component/form/Form";
import { FormattedDateTime } from "@/app/_lib/component/i18n/FormattedDateTime";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/app/_lib/component/shadcn/card";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { Textarea } from "@/app/_lib/component/shadcn/textarea";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { Composition } from "@/config/composition";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { Button } from "@/app/_lib/component/shadcn/button";
import { ConfirmationDialog } from "@/app/_lib/component/feedback/ConfirmationDialog";
import { useDialog } from "@/app/_lib/hook/useDialog";

type Props = {
  contestId: string;
  clarification: ClarificationResponseDTO;
} & (
  | {
      canAnswer: true;
      onAnswer: (data: ClarificationResponseDTO) => void;
      onPublish: (data: ClarificationResponseDTO) => void;
    }
  | {
      canAnswer?: false;
      onAnswer?: (data: ClarificationResponseDTO) => void;
      onPublish?: (data: ClarificationResponseDTO) => void;
    }
);

export function ClarificationsPageCard({
  contestId,
  clarification,
  canAnswer,
  onAnswer,
  onPublish,
}: Props) {
  const answerState = useLoadableState();
  const publishState = useLoadableState();
  const toast = useToast();
  const publishDialog = useDialog();

  const form = useForm<ClarificationAnswerFormType>({
    resolver: joiResolver(ClarificationAnswerForm.schema),
    defaultValues: ClarificationAnswerForm.getDefault(),
  });

  async function answerClarification(data: ClarificationAnswerFormType) {
    console.debug("Answering clarification with data:", data);
    answerState.start();

    try {
      const newClarification = await Composition.clarificationWritter.answer(
        contestId,
        clarification.id,
        ClarificationAnswerForm.toInputDTO(data),
      );

      toast.success("Clarification answered successfully");
      onAnswer?.(newClarification);
      answerState.finish();
      form.reset();
      console.debug("Clarification answered successfully:", newClarification);
    } catch (error) {
      await answerState.fail(error, {
        default: () => toast.error("Failed to answer clarification"),
      });
    }
  }

  async function publishClarification() {
    console.debug("Publishing clarification with id:", clarification.id);
    publishState.start();

    try {
      const publishedClarification =
        await Composition.clarificationWritter.publish(
          contestId,
          clarification.id,
        );

      toast.success("Clarification published successfully");
      onPublish?.(publishedClarification);
      publishState.finish();
      publishDialog.close();
      console.debug(
        "Clarification published successfully:",
        publishedClarification.id,
      );
    } catch (error) {
      await publishState.fail(error, {
        default: () => toast.error("Failed to publish clarification"),
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
                    {`Problem ${clarification.problem!.letter}`}
                  </Badge>
                )}
              </p>
            </div>
            <p
              className="text-default-400 text-xs"
              data-testid="clarification-created-at"
            >
              <FormattedDateTime timestamp={clarification.createdAt} />
            </p>
          </div>
          <Badge
            variant={clarification.isPublic ? "default" : "outline"}
            data-testid="clarification-is-public"
          >
            {clarification.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
        <p className="mt-3" data-testid="clarification-text">
          {clarification.text}
        </p>
      </CardContent>
      {!!clarification.answer || canAnswer ? <Separator /> : null}
      {!!clarification.answer || canAnswer ? (
        <CardFooter>
          {!!clarification.answer && (
            <div
              className="w-full pl-5"
              data-testid="clarification-answer-card"
            >
              <div className="flex items-center gap-4">
                <MessageCircleReplyIcon size={24} />
                <div>
                  <p
                    className="text-sm font-semibold"
                    data-testid="clarification-answer-member-name"
                  >
                    {clarification.answer.member.name}
                  </p>
                  <p
                    className="text-default-400 text-xs"
                    data-testid="clarification-answer-created-at"
                  >
                    <FormattedDateTime
                      timestamp={clarification.answer.createdAt}
                    />
                  </p>
                </div>
              </div>
              <p className="mt-3" data-testid="clarification-answer-text">
                {clarification.answer.text}
              </p>
              {!clarification.isPublic && (
                <div className="flex justify-end">
                  <AsyncButton
                    isLoading={publishState.isLoading}
                    onClick={publishDialog.open}
                    data-testid="clarification-publish-button"
                  >
                    Publish
                  </AsyncButton>
                </div>
              )}
            </div>
          )}
          {!clarification.answer && (
            <div className="flex-1" data-testid="clarification-answer-form">
              <Form onSubmit={form.handleSubmit(answerClarification)}>
                <FieldSet disabled={answerState.isLoading}>
                  <div className="flex flex-col items-end gap-3">
                    <ControlledField
                      form={form}
                      name="text"
                      label="Answer"
                      field={
                        <Textarea data-testid="clarification-answer-textarea" />
                      }
                    />
                    <AsyncButton
                      type="submit"
                      icon={<SendIcon size={16} />}
                      isLoading={answerState.isLoading}
                      data-testid="clarification-answer-submit-button"
                    >
                      Answer
                    </AsyncButton>
                  </div>
                </FieldSet>
              </Form>
            </div>
          )}
        </CardFooter>
      ) : null}

      <ConfirmationDialog
        isOpen={publishDialog.isOpen}
        title="Publish Clarification"
        description="Are you sure you want to publish this clarification? It will become visible to all participants."
        onCancel={() => publishDialog.close()}
        onConfirm={() => publishClarification()}
        isLoading={publishState.isLoading}
      />
    </Card>
  );
}
