import { RefreshCwIcon } from "lucide-react";

import { ConfirmationDialog } from "@/app/_lib/component/feedback/ConfirmationDialog";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useDialog } from "@/app/_lib/hook/useDialog";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { useAppSelector } from "@/app/_lib/store/Store";
import { Composition } from "@/config/composition";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { PrintRequestResponseDTO } from "@/port/dto/response/printRequest/PrintRequestResponseDTO";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

type Props = {
  submission: SubmissionWithCodeResponseDTO;
  onCreatePrintRequest: (printRequest: PrintRequestResponseDTO) => void;
  onClose: () => void;
};

export function SubmissionsPageActionCreatePrintRequest({
  submission,
  onCreatePrintRequest,
  onClose,
}: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const createPrintRequestState = useLoadableState();
  const toast = useToast();
  const dialog = useDialog();

  async function createPrintRequest() {
    console.debug(
      "Creating print request for submission with ID:",
      submission.id,
    );
    createPrintRequestState.start();

    try {
      const printRequest = await Composition.printRequestWriter.create(
        contestId,
        {
          submissionId: submission.id,
        },
      );

      toast.success(
        "[slug].(dashboard)._common.submissions.SubmissionsPageActionCreatePrintRequest.createSuccess",
      );
      onCreatePrintRequest(printRequest);
      dialog.close();
      createPrintRequestState.finish();
      console.debug("Print request created successfully");

      onClose();
    } catch (error) {
      await createPrintRequestState.fail(error, {
        default: () =>
          toast.error(
            "[slug].(dashboard)._common.submissions.SubmissionsPageActionCreatePrintRequest.createFailed",
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
        data-testid="submissions-page-action-create-print-request"
      >
        <RefreshCwIcon />
        <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionCreatePrintRequest.menuItemRequestPrint" />
      </DropdownMenuItem>

      <ConfirmationDialog
        isOpen={dialog.isOpen}
        title="[slug].(dashboard)._common.submissions.SubmissionsPageActionCreatePrintRequest.createDialogTitle"
        description="[slug].(dashboard)._common.submissions.SubmissionsPageActionCreatePrintRequest.createDialogDescription"
        onCancel={() => dialog.close()}
        onConfirm={() => createPrintRequest()}
        isLoading={createPrintRequestState.isLoading}
      />
    </>
  );
}
