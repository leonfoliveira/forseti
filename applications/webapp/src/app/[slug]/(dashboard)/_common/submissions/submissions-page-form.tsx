import { joiResolver } from "@hookform/resolvers/joi";
import { Send } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import { SubmissionFormType } from "@/app/[slug]/(dashboard)/_common/_form/submission-form";
import { SubmissionFormMap } from "@/app/[slug]/(dashboard)/_common/_form/submission-form-map";
import { submissionFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/submission-form-schema";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_lib/component/shadcn/select";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useToast } from "@/app/_lib/util/toast-hook";
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
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-form.source-label",
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
    resolver: joiResolver(submissionFormSchema),
    defaultValues: SubmissionFormMap.getDefault(),
  });
  const formRef = useRef<HTMLFormElement>(null);

  async function createSubmission(data: SubmissionFormType) {
    createSubmissionState.start();
    try {
      await submissionWritter.create(
        contestMetadata.id,
        SubmissionFormMap.toInputDTO(data),
      );
      form.reset();
      formRef.current?.reset();
      toast.success(messages.createSuccess);
      createSubmissionState.finish();
    } catch (error) {
      createSubmissionState.fail(error, {
        default: () => toast.error(messages.createError),
      });
    }
  }

  return (
    <Card className="w-full max-w-4xl" data-testid="submissions-form">
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
                <Select data-testid="submission-form-problem">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
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
              name="language"
              label={messages.languageLabel}
              field={
                <Select data-testid="submission-form-language">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {contestMetadata.languages.map((language) => (
                        <SelectItem key={language} value={language}>
                          <FormattedMessage
                            {...globalMessages.submissionLanguage[
                              language as SubmissionLanguage
                            ]}
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
