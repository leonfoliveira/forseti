import { RefreshCwIcon } from "lucide-react";

import { ConfirmationDialog } from "@/app/_lib/component/feedback/confirmation-dialog";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useDialog } from "@/app/_lib/hook/dialog-hook";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  resubmitLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-rerun.resubmit-label",
    defaultMessage: "Resubmit",
  },
  title: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-rerun.title",
    defaultMessage: "Are you sure you want to resubmit?",
  },
  description: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-rerun.description",
    defaultMessage:
      "This will send the submission to the judge queue again and may take some time to complete.",
  },
  cancel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-rerun.cancel",
    defaultMessage: "Cancel",
  },
  confirm: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-rerun.confirm",
    defaultMessage: "Confirm",
  },
  resubmitSuccess: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-rerun.resubmit-success",
    defaultMessage: "Submission resubmitted successfully",
  },
  resubmitError: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-rerun.resubmit-error",
    defaultMessage: "Failed to resubmit submission",
  },
});

type Props = {
  submission: SubmissionWithCodeAndExecutionsResponseDTO;
  onClose: () => void;
  onRerun: (submission: SubmissionWithCodeAndExecutionsResponseDTO) => void;
};

export function SubmissionsPageActionRerun({
  submission,
  onClose,
  onRerun,
}: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const resubmitState = useLoadableState();
  const toast = useToast();
  const dialog = useDialog();

  async function resubmitSubmission(submissionId: string) {
    console.debug("Resubmitting submission with ID:", submissionId);
    resubmitState.start();

    try {
      await Composition.submissionWritter.rerun(contestId, submissionId);

      toast.success(messages.resubmitSuccess);
      onRerun({
        ...submission,
        status: SubmissionStatus.JUDGING,
        answer: undefined,
      });
      dialog.close();
      resubmitState.finish();
      console.debug("Submission resubmitted successfully");

      onClose();
    } catch (error) {
      await resubmitState.fail(error, {
        default: () => toast.error(messages.resubmitError),
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
        data-testid="submissions-page-action-rerun"
      >
        <RefreshCwIcon />
        <FormattedMessage {...messages.resubmitLabel} />
      </DropdownMenuItem>

      <ConfirmationDialog
        isOpen={dialog.isOpen}
        title={messages.title}
        description={messages.description}
        onCancel={() => dialog.close()}
        onConfirm={() => resubmitSubmission(submission.id)}
        isLoading={resubmitState.isLoading}
      />
    </>
  );
}
