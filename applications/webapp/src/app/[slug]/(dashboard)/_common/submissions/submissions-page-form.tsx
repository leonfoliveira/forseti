import { joiResolver } from "@hookform/resolvers/joi";
import { Send } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import {
  SubmissionForm,
  SubmissionFormType,
} from "@/app/[slug]/(dashboard)/_common/submissions/submission-form";
import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { Form } from "@/app/_lib/component/form/form";
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
import { Input } from "@/app/_lib/component/shadcn/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/app/_lib/component/shadcn/native-select";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { submissionWritter } from "@/config/composition";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  createTitle: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-form.create-title",
    defaultMessage: "Create Submission",
  },
  createDescription: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-form.create-description",
    defaultMessage: "Fill out the form below to create a new submission.",
  },
  problemLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-form.problem-label",
    defaultMessage: "Problem",
  },
  problemOption: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-form.problem-option",
    defaultMessage: "{letter}. {title}",
  },
  languageLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-form.language-label",
    defaultMessage: "Language",
  },
  codeLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-form.code-label",
    defaultMessage: "Code",
  },
  cancelLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-form.cancel-label",
    defaultMessage: "Cancel",
  },
  submitLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-form.submit-label",
    defaultMessage: "Submit",
  },
  createSuccess: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-form.create-success",
    defaultMessage: "Submission created successfully",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-form.create-error",
    defaultMessage: "Failed to create submission",
  },
});

type Props = {
  onClose: () => void;
  problems: ProblemPublicResponseDTO[];
};

export function SubmissionsPageForm({ onClose, problems }: Props) {
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const createSubmissionState = useLoadableState();
  const toast = useToast();

  const form = useForm<SubmissionFormType>({
    resolver: joiResolver(SubmissionForm.schema),
    defaultValues: SubmissionForm.getDefault(),
  });
  const formRef = useRef<HTMLFormElement>(null);

  async function createSubmission(data: SubmissionFormType) {
    createSubmissionState.start();
    try {
      await submissionWritter.create(
        contestMetadata.id,
        SubmissionForm.toInputDTO(data),
      );
      form.reset();
      formRef.current?.reset();
      toast.success(messages.createSuccess);
      createSubmissionState.finish();
      onClose();
    } catch (error) {
      createSubmissionState.fail(error, {
        default: () => toast.error(messages.createError),
      });
    }
  }

  return (
    <Card className="w-full max-w-4xl" data-testid="submission-form">
      <CardHeader>
        <CardTitle>
          <FormattedMessage {...messages.createTitle} />
        </CardTitle>
        <CardDescription>
          <FormattedMessage {...messages.createDescription} />
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <Form ref={formRef} onSubmit={form.handleSubmit(createSubmission)}>
          <FieldSet disabled={createSubmissionState.isLoading}>
            <ControlledField
              form={form}
              name="problemId"
              label={messages.problemLabel}
              field={
                <NativeSelect data-testid="submission-form-problem">
                  <NativeSelectOption value="" disabled />
                  {problems.map((problem) => (
                    <NativeSelectOption key={problem.id} value={problem.id}>
                      <FormattedMessage
                        {...messages.problemOption}
                        values={problem}
                      />
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              }
            />
            <ControlledField
              form={form}
              name="language"
              label={messages.languageLabel}
              field={
                <NativeSelect data-testid="submission-form-language">
                  <NativeSelectOption value="" disabled />
                  {contestMetadata.languages.map((language) => (
                    <NativeSelectOption key={language} value={language}>
                      <FormattedMessage
                        {...globalMessages.submissionLanguage[
                          language as SubmissionLanguage
                        ]}
                      />
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              }
            />
            <ControlledField
              form={form}
              name="code"
              label={messages.codeLabel}
              field={<Input type="file" data-testid="submission-form-code" />}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="submission-form-cancel"
              >
                <FormattedMessage {...messages.cancelLabel} />
              </Button>
              <AsyncButton
                type="submit"
                isLoading={createSubmissionState.isLoading}
                data-testid="submission-form-submit"
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
