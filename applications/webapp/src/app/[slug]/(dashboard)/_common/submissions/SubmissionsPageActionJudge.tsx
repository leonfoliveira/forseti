import { joiResolver } from "@hookform/resolvers/joi";
import { GavelIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  SubmissionJudgeForm,
  SubmissionJudgeFormType,
} from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionJudgeForm";
import { ConfirmationDialog } from "@/app/_lib/component/feedback/ConfirmationDialog";
import { ControlledField } from "@/app/_lib/component/form/ControlledField";
import { Form } from "@/app/_lib/component/form/Form";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/app/_lib/component/shadcn/native-select";
import { useDialog } from "@/app/_lib/hook/useDialog";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { useAppSelector } from "@/app/_lib/store/Store";
import { Composition } from "@/config/composition";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { SubmissionWithCodeAndExecutionResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionResponseDTO";
import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";

type Props = {
  submission: SubmissionWithCodeAndExecutionResponseDTO;
  onClose: () => void;
  onJudge: (submission: SubmissionWithCodeAndExecutionResponseDTO) => void;
};

export function SubmissionsPageActionJudge({
  submission,
  onClose,
  onJudge,
}: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const judgeState = useLoadableState();
  const toast = useToast();
  const dialog = useDialog();

  const judgeForm = useForm<SubmissionJudgeFormType>({
    resolver: joiResolver(SubmissionJudgeForm.schema),
    defaultValues: SubmissionJudgeForm.getDefault(),
  });

  async function judgeSubmission(data: SubmissionJudgeFormType) {
    console.debug("Judging submission with data:", data);
    judgeState.start();

    try {
      await Composition.submissionWritter.updateAnswer(
        contestId,
        submission.id,
        data.answer,
      );

      toast.success("Submission judged successfully");
      onJudge({ ...submission, answer: data.answer });
      judgeForm.reset();
      dialog.close();
      judgeState.finish();
      console.debug("Submission judged successfully");

      onClose();
    } catch (error) {
      await judgeState.fail(error, {
        default: () => toast.error("Failed to judge submission"),
      });
    }
  }

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          dialog.open();
        }}
        data-testid="submissions-page-action-judge"
      >
        <GavelIcon />
        Judge
      </DropdownMenuItem>

      <ConfirmationDialog
        isOpen={dialog.isOpen}
        title="Are you sure you want to judge?"
        description="This will override any existing answer."
        content={
          <Form
            onSubmit={judgeForm.handleSubmit(judgeSubmission)}
            className="my-3 w-full"
          >
            <FieldSet disabled={judgeState.isLoading}>
              <ControlledField
                form={judgeForm}
                name="answer"
                label="Answer"
                field={
                  <NativeSelect data-testid="submission-judge-form-answer">
                    <NativeSelectOption value="" disabled />
                    {Object.keys(SubmissionAnswer).map((answer) => (
                      <NativeSelectOption key={answer} value={answer}>
                        {EnumeratedTextUtil.getSubmissionAnswer(
                          answer as SubmissionAnswer,
                        )}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                }
              />
            </FieldSet>
          </Form>
        }
        onCancel={dialog.close}
        onConfirm={judgeForm.handleSubmit(judgeSubmission)}
        isLoading={judgeState.isLoading}
      />
    </>
  );
}
