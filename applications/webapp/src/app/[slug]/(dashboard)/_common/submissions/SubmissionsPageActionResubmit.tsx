import { RefreshCwIcon } from "lucide-react";

import { ConfirmationDialog } from "@/app/_lib/component/feedback/ConfirmationDialog";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useDialog } from "@/app/_lib/hook/useDialog";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { useAppSelector } from "@/app/_lib/store/Store";
import { Composition } from "@/config/composition";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

type Props = {
  submission: SubmissionWithCodeAndExecutionsResponseDTO;
  onClose: () => void;
  onResubmit: (submission: SubmissionWithCodeAndExecutionsResponseDTO) => void;
};

export function SubmissionsPageActionResubmit({
  submission,
  onClose,
  onResubmit,
}: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const resubmitState = useLoadableState();
  const toast = useToast();
  const dialog = useDialog();

  async function resubmitSubmission(submissionId: string) {
    console.debug("Resubmitting submission with ID:", submissionId);
    resubmitState.start();

    try {
      const updatedSubmission = await Composition.submissionWriter.resubmit(
        contestId,
        submissionId,
      );

      toast.success(
        "[slug].(dashboard)._common.submissions.SubmissionsPageActionResubmit.resubmitSuccess",
      );
      onResubmit(updatedSubmission);
      dialog.close();
      resubmitState.finish();
      console.debug("Submission resubmitted successfully");

      onClose();
    } catch (error) {
      await resubmitState.fail(error, {
        default: () =>
          toast.error(
            "[slug].(dashboard)._common.submissions.SubmissionsPageActionResubmit.resubmitFailed",
          ),
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
        data-testid="submissions-page-action-resubmit"
      >
        <RefreshCwIcon />
        <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionResubmit.menuItemResubmit" />
      </DropdownMenuItem>

      <ConfirmationDialog
        isOpen={dialog.isOpen}
        title="[slug].(dashboard)._common.submissions.SubmissionsPageActionResubmit.resubmitDialogTitle"
        description="[slug].(dashboard)._common.submissions.SubmissionsPageActionResubmit.resubmitDialogDescription"
        onCancel={() => dialog.close()}
        onConfirm={() => resubmitSubmission(submission.id)}
        isLoading={resubmitState.isLoading}
      />
    </>
  );
}
