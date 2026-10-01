import { RefreshCwIcon } from "lucide-react";

import { ConfirmationDialog } from "@/app/_lib/component/feedback/ConfirmationDialog";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useDialog } from "@/app/_lib/hook/useDialog";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { useAppSelector } from "@/app/_store/Store";
import { Composition } from "@/config/composition";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

type Props = {
  submission: SubmissionWithCodeResponseDTO;
  onClose: () => void;
  onRerun: (submission: SubmissionWithCodeResponseDTO) => void;
};

export function SubmissionsPageActionResubmit({
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
      await Composition.submissionWritter.resubmit(contestId, submissionId);

      toast.success("Submission resubmitted successfully");
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
        default: () => toast.error("Failed to resubmit submission"),
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
        Resubmit
      </DropdownMenuItem>

      <ConfirmationDialog
        isOpen={dialog.isOpen}
        title="Resubmit Submission"
        description="Are you sure you want to resubmit this submission?"
        onCancel={() => dialog.close()}
        onConfirm={() => resubmitSubmission(submission.id)}
        isLoading={resubmitState.isLoading}
      />
    </>
  );
}
