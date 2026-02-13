import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { ConfirmationDialog } from "@/app/_lib/component/feedback/confirmation-dialog";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { submissionWritter } from "@/config/composition";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
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
  submission: SubmissionFullResponseDTO;
  onClose: () => void;
};

export function SubmissionsPageActionRerun({ submission, onClose }: Props) {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const resubmitState = useLoadableState();
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function resubmitSubmission(submissionId: string) {
    resubmitState.start();
    try {
      await submissionWritter.rerun(contestId, submissionId);
      toast.success(messages.resubmitSuccess);
      setIsDialogOpen(false);
      resubmitState.finish();
      onClose();
    } catch (error) {
      resubmitState.fail(error, {
        default: () => toast.error(messages.resubmitError),
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
        data-testid="submissions-page-action-rerun"
      >
        <RefreshCw />
        <FormattedMessage {...messages.resubmitLabel} />
      </DropdownMenuItem>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        title={messages.title}
        description={messages.description}
        onCancel={() => setIsDialogOpen(false)}
        onConfirm={() => resubmitSubmission(submission.id)}
        isLoading={resubmitState.isLoading}
      />
    </>
  );
}
