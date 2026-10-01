import { joiResolver } from "@hookform/resolvers/joi";
import { SendIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import {
  SubmissionForm,
  SubmissionFormType,
} from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionForm";
import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
import { ControlledField } from "@/app/_lib/component/form/ControlledField";
import { Form } from "@/app/_lib/component/form/Form";
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
import { useAppSelector } from "@/app/_store/Store";
import { Composition } from "@/config/composition";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";

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
      const newSubmission = await Composition.submissionWritter.create(
        contest.id,
        SubmissionForm.toInputDTO(data),
      );

      toast.success("Submission created successfully");
      onCreate(newSubmission);
      form.reset();
      formRef.current?.reset();
      createSubmissionState.finish();
      console.debug("Submission created successfully:", newSubmission);

      onClose();
    } catch (error) {
      await createSubmissionState.fail(error, {
        default: () => toast.error("Failed to create submission"),
      });
    }
  }

  return (
    <Card className="w-full max-w-4xl" data-testid="submission-form">
      <CardHeader>
        <CardTitle>Create Submission</CardTitle>
        <CardDescription>
          Create a new submission by selecting a problem, programming language,
          and uploading your code file.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <Form ref={formRef} onSubmit={form.handleSubmit(createSubmission)}>
          <FieldSet disabled={createSubmissionState.isLoading}>
            <ControlledField
              form={form}
              name="problemId"
              label="Problem"
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
              label="Language"
              field={
                <NativeSelect data-testid="submission-form-language">
                  <NativeSelectOption value="" disabled />
                  {contest.languages.map((language) => (
                    <NativeSelectOption key={language} value={language}>
                      {EnumeratedTextUtil.getSubmissionLanguage(
                        language as SubmissionLanguage,
                      )}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              }
            />
            <ControlledField
              form={form}
              name="code"
              label="Code"
              field={<Input type="file" data-testid="submission-form-code" />}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="submission-form-cancel"
              >
                Cancel
              </Button>
              <AsyncButton
                type="submit"
                icon={<SendIcon size={16} />}
                isLoading={createSubmissionState.isLoading}
                data-testid="submission-form-submit"
              >
                Submit
              </AsyncButton>
            </div>
          </FieldSet>
        </Form>
      </CardContent>
    </Card>
  );
}
