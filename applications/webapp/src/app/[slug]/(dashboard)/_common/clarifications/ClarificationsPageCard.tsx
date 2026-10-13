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

type Props = {
  contestId: string;
  clarification: ClarificationResponseDTO;
} & (
  | {
      canAnswer: true;
      onAnswer: (data: ClarificationAnswerFormType) => void;
    }
  | {
      canAnswer?: false;
      onAnswer?: (data: ClarificationAnswerFormType) => void;
    }
);

export function ClarificationsPageCard({
  contestId,
  clarification,
  canAnswer,
  onAnswer,
}: Props) {
  const answerClarificationState = useLoadableState();
  const toast = useToast();

  const form = useForm<ClarificationAnswerFormType>({
    resolver: joiResolver(ClarificationAnswerForm.schema),
    defaultValues: ClarificationAnswerForm.getDefault(),
  });

  async function answerClarification(data: ClarificationAnswerFormType) {
    console.debug("Answering clarification with data:", data);
    answerClarificationState.start();

    try {
      const newClarification = await Composition.clarificationWritter.create(
        contestId,
        ClarificationAnswerForm.toInputDTO(data),
      );

      toast.success("Clarification answered successfully");
      onAnswer?.(newClarification);
      answerClarificationState.finish();
      form.reset();
      console.debug("Clarification answered successfully:", newClarification);
    } catch (error) {
      await answerClarificationState.fail(error, {
        default: () => toast.error("Failed to answer clarification"),
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
        </div>
        <p className="mt-3" data-testid="clarification-text">
          {clarification.text}
        </p>
      </CardContent>
      {!!clarification.answer || canAnswer ? <Separator /> : null}
      {!!clarification.answer || canAnswer ? (
        <CardFooter>
          {!!clarification.answer && (
            <div className="ml-5" data-testid="clarification-answer-card">
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
            </div>
          )}
          {!clarification.answer && (
            <div className="flex-1" data-testid="clarification-answer-form">
              <Form onSubmit={form.handleSubmit(answerClarification)}>
                <FieldSet disabled={answerClarificationState.isLoading}>
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
                      isLoading={answerClarificationState.isLoading}
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
    </Card>
  );
}
