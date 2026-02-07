import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { UseFormReturn } from "react-hook-form";

import { SubmissionFormType } from "@/app/[slug]/(dashboard)/_common/_form/submission-form";
import { Card } from "@/app/_lib/component/base/display/card";
import { Button } from "@/app/_lib/component/base/form/button";
import { FileInput } from "@/app/_lib/component/base/form/file-input";
import { Form } from "@/app/_lib/component/base/form/form";
import { Select } from "@/app/_lib/component/base/form/select";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { useIntl } from "@/app/_lib/util/intl-hook";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages, Message } from "@/i18n/message";

const messages = defineMessages({
  createTitle: {
    id: "app.[slug].(dashboard)._common.submissions.create-submission-form.create-title",
    defaultMessage: "Create Submission",
  },
  problemLabel: {
    id: "app.[slug].(dashboard)._common.submissions.create-submission-form.problem-label",
    defaultMessage: "Problem",
  },
  problemOption: {
    id: "app.[slug].(dashboard)._common.submissions.create-submission-form.problem-option",
    defaultMessage: "{letter}. {title}",
  },
  languageLabel: {
    id: "app.[slug].(dashboard)._common.submissions.create-submission-form.language-label",
    defaultMessage: "Language",
  },
  languageDescription: {
    id: "app.[slug].(dashboard)._common.submissions.create-submission-form.language-description",
    defaultMessage: "Select the programming language used in the submission.",
  },
  codeLabel: {
    id: "app.[slug].(dashboard)._common.submissions.create-submission-form.code-label",
    defaultMessage: "Code",
  },
  codeDescription: {
    id: "app.[slug].(dashboard)._common.submissions.create-submission-form.code-description",
    defaultMessage: "Upload an uncompiled code file.",
  },
  submitLabel: {
    id: "app.[slug].(dashboard)._common.submissions.create-submission-form.submit-label",
    defaultMessage: "Submit",
  },
});

type Props = {
  form: UseFormReturn<SubmissionFormType>;
  onCreate: (data: SubmissionFormType) => Promise<void>;
  isLoading: boolean;
  formRef: React.Ref<HTMLFormElement>;
  problems: ProblemPublicResponseDTO[];
  languages: SubmissionLanguage[];
};

export function CreateSubmissionForm({
  form,
  onCreate,
  isLoading,
  formRef,
  problems,
  languages,
}: Props) {
  const intl = useIntl();

  return (
    <Card className="mx-auto mb-6 w-full max-w-4xl" data-testid="create-form">
      <Card.Header>
        <h3 className="text-lg font-semibold" data-testid="create-form-title">
          <FormattedMessage {...messages.createTitle} />
        </h3>
      </Card.Header>
      <Divider />
      <Card.Body>
        <form
          onSubmit={form.handleSubmit(onCreate)}
          className="grid gap-2"
          ref={formRef}
        >
          <Form.Field form={form} name="problemId">
            <Select label={<FormattedMessage {...messages.problemLabel} />}>
              {problems.map((it) => (
                <Select.Item key={it.id}>
                  {intl.formatMessage({
                    ...messages.problemOption,
                    values: it,
                  } as Message)}
                </Select.Item>
              ))}
            </Select>
          </Form.Field>
          <Form.Field form={form} name="language">
            <Select label={<FormattedMessage {...messages.languageLabel} />}>
              {languages.map((it) => (
                <Select.Item key={it}>
                  {intl.formatMessage(globalMessages.language[it])}
                </Select.Item>
              ))}
            </Select>
          </Form.Field>
          <Form.Field form={form} name="code">
            <FileInput
              label={<FormattedMessage {...messages.codeLabel} />}
              description={<FormattedMessage {...messages.codeDescription} />}
            />
          </Form.Field>
          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              endContent={<PaperAirplaneIcon height={12} />}
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
