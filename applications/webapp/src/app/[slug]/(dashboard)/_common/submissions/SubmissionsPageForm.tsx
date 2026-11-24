import { joiResolver } from "@hookform/resolvers/joi";
import { SendIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
import { ControlledField } from "@/app/_lib/component/form/ControlledField";
import { Form } from "@/app/_lib/component/form/Form";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
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
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { useAppSelector } from "@/app/_lib/store/Store";
import { I18nUtil } from "@/app/_lib/util/i18nUtil";
import {
  SubmissionForm,
  SubmissionFormType,
} from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionForm";
import { Composition } from "@/config/composition";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

type Props = {
  onClose: () => void;
  problems: ProblemResponseDTO[];
  onCreate: (submission: SubmissionWithCodeResponseDTO) => void;
};

export function SubmissionsPageForm({ onClose, problems, onCreate }: Props) {
  const contest = useAppSelector((state) => state.contest);
  const createSubmissionState = useLoadableState();
  const toast = useToast();

  const form = useForm<SubmissionFormType>({
    resolver: joiResolver(SubmissionForm.schema),
    defaultValues: SubmissionForm.getDefault(),
  });
  const formRef = useRef<HTMLFormElement>(null);

  async function createSubmission(data: SubmissionFormType) {
    console.debug("Creating submission with data:", data);
    createSubmissionState.start();

    try {
      const newSubmission = await Composition.submissionWriter.create(
        contest.id,
        SubmissionForm.toInputDTO(data),
      );

      toast.success(
        "[slug].(dashboard)._common.submissions.SubmissionsPageForm.createSuccess",
      );
      onCreate(newSubmission);
      form.reset();
      formRef.current?.reset();
      createSubmissionState.finish();
      console.debug("Submission created successfully:", newSubmission);

      onClose();
    } catch (error) {
      await createSubmissionState.fail(error, {
        default: () =>
          toast.error(
            "[slug].(dashboard)._common.submissions.SubmissionsPageForm.createFailed",
          ),
      });
    }
  }

  return (
    <Card className="w-full max-w-4xl" data-testid="submission-form">
      <CardHeader>
        <CardTitle>
          <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageForm.title" />
        </CardTitle>
        <CardDescription>
          <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageForm.subtitle" />
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <Form ref={formRef} onSubmit={form.handleSubmit(createSubmission)}>
          <FieldSet disabled={createSubmissionState.isLoading}>
            <ControlledField
              form={form}
              name="problemId"
              label="[slug].(dashboard)._common.submissions.SubmissionsPageForm.problemLabel"
              field={
                <NativeSelect data-testid="submission-form-problem">
                  <NativeSelectOption value="" disabled />
                  {problems.map((problem) => (
                    <NativeSelectOption key={problem.id} value={problem.id}>
                      {`${problem.letter}. ${problem.title}`}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              }
            />
            <ControlledField
              form={form}
              name="language"
              label="[slug].(dashboard)._common.submissions.SubmissionsPageForm.languageLabel"
              field={
                <NativeSelect data-testid="submission-form-language">
                  <NativeSelectOption value="" disabled />
                  {contest.languages.map((language) => (
                    <NativeSelectOption key={language} value={language}>
                      <FormattedMessage
                        id={I18nUtil.getSubmissionLanguage(
                          language as SubmissionLanguage,
                        )}
                      />
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              }
            />
            <ControlledField
              form={form}
              name="code"
              label="[slug].(dashboard)._common.submissions.SubmissionsPageForm.codeLabel"
              field={<Input type="file" data-testid="submission-form-code" />}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="submission-form-cancel"
              >
                <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageForm.cancel" />
              </Button>
              <AsyncButton
                type="submit"
                icon={<SendIcon size={16} />}
                isLoading={createSubmissionState.isLoading}
                data-testid="submission-form-submit"
              >
                <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageForm.submit" />
              </AsyncButton>
            </div>
          </FieldSet>
        </Form>
      </CardContent>
    </Card>
  );
}
