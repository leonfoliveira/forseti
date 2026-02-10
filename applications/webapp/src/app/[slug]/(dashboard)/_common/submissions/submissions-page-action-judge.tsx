import { joiResolver } from "@hookform/resolvers/joi";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  SubmissionJudgeForm,
  SubmissionJudgeFormType,
} from "@/app/[slug]/(dashboard)/_common/submissions/submission-judge-form";
import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { Form } from "@/app/_lib/component/form/form";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_lib/component/shadcn/alert-dialog";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_lib/component/shadcn/select";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useToast } from "@/app/_lib/util/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { submissionWritter } from "@/config/composition";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
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
  submission: SubmissionFullResponseDTO;
};

export function SubmissionsPageActionJudge({ submission }: Props) {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const judgeState = useLoadableState();
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const judgeForm = useForm<SubmissionJudgeFormType>({
    resolver: joiResolver(SubmissionJudgeForm.schema),
    defaultValues: SubmissionJudgeForm.getDefault(),
  });

  async function judgeSubmission(data: SubmissionJudgeFormType) {
    judgeState.start();
    try {
      await submissionWritter.updateAnswer(
        contestId,
        submission.id,
        data.answer,
      );
      toast.success(messages.judgeSuccess);
      judgeForm.reset();
      setIsDialogOpen(false);
      judgeState.finish();
    } catch (error) {
      judgeState.fail(error, {
        default: () => toast.error(messages.judgeError),
      });
    }
  }

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          setIsDialogOpen(true);
        }}
        data-testid="submissions-page-action-judge"
      >
        <RefreshCw />
        <FormattedMessage {...messages.judgeLabel} />
      </DropdownMenuItem>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <FormattedMessage {...messages.title} />
            </AlertDialogTitle>
            <AlertDialogDescription>
              <FormattedMessage {...messages.description} />
            </AlertDialogDescription>
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
                    <Select data-testid="submission-judge-form-answer">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.keys(SubmissionAnswer)
                            .filter(
                              (answer) => answer !== SubmissionAnswer.NO_ANSWER,
                            )
                            .map((answer) => (
                              <SelectItem key={answer} value={answer}>
                                <FormattedMessage
                                  {...globalMessages.submissionAnswer[
                                    answer as SubmissionAnswer
                                  ]}
                                />
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  }
                />
              </FieldSet>
            </Form>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={judgeState.isLoading}>
              <FormattedMessage {...messages.cancel} />
            </AlertDialogCancel>
            <AsyncButton
              onClick={() => judgeSubmission(judgeForm.getValues())}
              isLoading={judgeState.isLoading}
              data-testid="dialog-confirm-button"
            >
              <FormattedMessage {...messages.confirm} />
            </AsyncButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
