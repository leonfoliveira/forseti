import { UseFormReturn } from "react-hook-form";

import { ClarificationFormType } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form";
import { Card } from "@/app/_lib/component/base/display/card";
import { Button } from "@/app/_lib/component/base/form/button";
import { Form } from "@/app/_lib/component/base/form/form";
import { Input } from "@/app/_lib/component/base/form/input";
import { Select } from "@/app/_lib/component/base/form/select";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { useIntl } from "@/app/_lib/util/intl-hook";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages, Message } from "@/i18n/message";

const messages = defineMessages({
  createTitle: {
    id: "app.[slug].(dashboard)._common.clarifications.create-clarification-form.create-title",
    defaultMessage: "Create Clarification",
  },
  textLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.create-clarification-form.text-label",
    defaultMessage: "Text",
  },
  problemLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.create-clarification-form.problem-label",
    defaultMessage: "Problem (optional)",
  },
  problemOption: {
    id: "app.[slug].(dashboard)._common.clarifications.create-clarification-form.problem-option",
    defaultMessage: "{letter}. {title}",
  },
  submitLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.create-clarification-form.submit-label",
    defaultMessage: "Submit",
  },
});

type Props = {
  form: UseFormReturn<ClarificationFormType>;
  onSubmit: (data: ClarificationFormType) => Promise<void>;
  isLoading: boolean;
  problems: ProblemPublicResponseDTO[];
};

export function CreateClarificationForm({
  form,
  onSubmit,
  isLoading,
  problems,
}: Props) {
  const intl = useIntl();

  return (
    <Card className="max-w-4xl w-full mb-6" data-testid="create-form">
      <Card.Header>
        <h3 className="text-lg font-semibold" data-testid="create-form-title">
          <FormattedMessage {...messages.createTitle} />
        </h3>
      </Card.Header>
      <Divider />
      <Card.Body>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              isLoading={isLoading}
              data-testid="create-form-submit"
            >
              <FormattedMessage {...messages.submitLabel} />
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}
