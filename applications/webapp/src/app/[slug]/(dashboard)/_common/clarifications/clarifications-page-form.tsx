import { joiResolver } from "@hookform/resolvers/joi";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";

import { ClarificationFormType } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form";
import { ClarificationFormMap } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form-map";
import { clarificationFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form-schema";
import { Form } from "@/app/_lib/component/base/form/form";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_lib/component/shadcn/card";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_lib/component/shadcn/select";
import { Textarea } from "@/app/_lib/component/shadcn/textarea";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useToast } from "@/app/_lib/util/toast-hook";
import { clarificationWritter } from "@/config/composition";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  createTitle: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-form.create-title",
    defaultMessage: "Create Clarification",
  },
  createDescription: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-form.create-description",
    defaultMessage:
      "Submit a new clarification request for a contest problem or a general question.",
  },
  textLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-form.text-label",
    defaultMessage: "Message",
  },
  problemLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-form.problem-label",
    defaultMessage: "Problem",
  },
  problemOption: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-form.problem-option",
    defaultMessage: "{letter}. {title}",
  },
  problemNone: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-form.problem-none",
    defaultMessage: "None (General question)",
  },
  cancelLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-form.cancel-label",
    defaultMessage: "Cancel",
  },
  submitLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-form.submit-label",
    defaultMessage: "Submit",
  },
  createSuccess: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-form.create-success",
    defaultMessage: "Clarification created successfully",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page-form.create-error",
    defaultMessage: "Failed to create clarification",
  },
});

type Props = {
  contestId: string;
  onClose: () => void;
  problems: ProblemPublicResponseDTO[];
};

export function ClarificationsPageForm({
  contestId,
  onClose,
  problems,
}: Props) {
  const toast = useToast();
  const createClarificationState = useLoadableState();

  const form = useForm<ClarificationFormType>({
    resolver: joiResolver(clarificationFormSchema),
    defaultValues: ClarificationFormMap.getDefault(),
  });

  async function createClarification(data: ClarificationFormType) {
    createClarificationState.start();
    try {
      await clarificationWritter.create(
        contestId,
        ClarificationFormMap.toInputDTO(data),
      );
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
    <Card className="w-full max-w-4xl" data-testid="clarification-form">
      <CardHeader>
        <CardTitle>
          <FormattedMessage {...messages.createTitle} />
        </CardTitle>
        <CardDescription>
          <FormattedMessage {...messages.createDescription} />
        </CardDescription>
      </CardHeader>
      <Divider />
      <CardContent>
        <Form onSubmit={form.handleSubmit(createClarification)}>
          <FieldSet disabled={createClarificationState.isLoading}>
            <ControlledField
              form={form}
              name="problemId"
              label={messages.problemLabel}
              field={
                <Select data-testid="clarification-form-problem">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="__none__">
                        <FormattedMessage {...messages.problemNone} />
                      </SelectItem>
                      {problems.map((problem) => (
                        <SelectItem key={problem.id} value={problem.id}>
                          <FormattedMessage
                            {...messages.problemOption}
                            values={problem}
                          />
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              }
            />
            <ControlledField
              form={form}
              name="text"
              label={messages.textLabel}
              field={<Textarea data-testid="clarification-form-text" />}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="clarification-form-cancel"
              >
                <FormattedMessage {...messages.cancelLabel} />
              </Button>
              <AsyncButton
                type="submit"
                isLoading={createClarificationState.isLoading}
                data-testid="clarification-form-submit"
              >
                <FormattedMessage {...messages.submitLabel} />
                <Send size={16} />
              </AsyncButton>
            </div>
          </FieldSet>
        </Form>
      </CardContent>
    </Card>
  );
}
