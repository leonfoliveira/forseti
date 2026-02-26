import { joiResolver } from "@hookform/resolvers/joi";
import { GavelIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  SubmissionJudgeForm,
  SubmissionJudgeFormType,
} from "@/app/[slug]/(dashboard)/_common/submissions/submission-judge-form";
import { ConfirmationDialog } from "@/app/_lib/component/feedback/confirmation-dialog";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { Form } from "@/app/_lib/component/form/form";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/app/_lib/component/shadcn/native-select";
import { useDialog } from "@/app/_lib/hook/dialog-hook";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  judgeLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-judge.judge-label",
    defaultMessage: "Judge",
  },
  title: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-judge.title",
    defaultMessage: "Are you sure you want to judge?",
  },
  description: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-judge.description",
    defaultMessage: "This will override any existing answer.",
  },
  cancel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-judge.cancel",
    defaultMessage: "Cancel",
  },
  confirm: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-judge.confirm",
    defaultMessage: "Confirm",
  },
  judgeSuccess: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-judge.judge-success",
    defaultMessage: "Submission judged successfully",
  },
  judgeError: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-judge.judge-error",
    defaultMessage: "Failed to judge submission",
  },
  answerLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-judge.answer-label",
    defaultMessage: "Answer",
  },
});

type Props = {
  submission: SubmissionWithCodeAndExecutionsResponseDTO;
  onClose: () => void;
  onJudge: (submission: SubmissionWithCodeAndExecutionsResponseDTO) => void;
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

      toast.success(messages.judgeSuccess);
      onJudge({ ...submission, answer: data.answer });
      judgeForm.reset();
      dialog.close();
      judgeState.finish();
      console.debug("Submission judged successfully");

      onClose();
    } catch (error) {
      await judgeState.fail(error, {
        default: () => toast.error(messages.judgeError),
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
        <FormattedMessage {...messages.judgeLabel} />
      </DropdownMenuItem>

      <ConfirmationDialog
        isOpen={dialog.isOpen}
        title={messages.title}
        description={messages.description}
        content={
          <Form
            onSubmit={judgeForm.handleSubmit(judgeSubmission)}
            className="my-3 w-full"
          >
            <FieldSet disabled={judgeState.isLoading}>
              <ControlledField
                form={judgeForm}
                name="answer"
                label={messages.answerLabel}
                field={
                  <NativeSelect data-testid="submission-judge-form-answer">
                    <NativeSelectOption value="" disabled />
                    {Object.keys(SubmissionAnswer).map((answer) => (
                      <NativeSelectOption key={answer} value={answer}>
                        <FormattedMessage
                          {...globalMessages.submissionAnswer[
                            answer as SubmissionAnswer
                          ]}
                        />
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
