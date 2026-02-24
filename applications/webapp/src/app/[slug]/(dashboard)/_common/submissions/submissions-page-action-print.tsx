import { DownloadIcon } from "lucide-react";
import { useState } from "react";

import { ConfirmationDialog } from "@/app/_lib/component/feedback/confirmation-dialog";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  printLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-print.print-label",
    defaultMessage: "Request print",
  },
  printSuccess: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-print.print-success",
    defaultMessage: "Print requested successfully",
  },
  printError: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-print.print-error",
    defaultMessage: "Failed to request print",
  },
  confirmTitle: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-print.confirm-title",
    defaultMessage:
      "Are you sure you want to request a print of this submission code?",
  },
  confirmDescription: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-print.confirm-description",
    defaultMessage:
      "This will create a ticket for the contest staff to print your submission code. It may take some time for the ticket to be fulfilled.",
  },
});

type Props = {
  submission: SubmissionWithCodeResponseDTO;
  onClose: () => void;
  onRequest: (ticket: TicketResponseDTO) => void;
};

export function SubmissionsPageActionPrint({
  submission,
  onClose,
  onRequest,
}: Props) {
  const requestPrintState = useLoadableState();
  const contestId = useAppSelector((state) => state.contest.id);
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function requestPrint() {
    console.debug("Requesting print for submission:", submission);
    requestPrintState.start();

    try {
      const newTicket = await Composition.ticketWritter.create(contestId, {
        type: TicketType.SUBMISSION_PRINT,
        properties: {
          submissionId: submission.id,
          attachmentId: submission.code.id,
        },
      });

      toast.success(messages.printSuccess);
      onRequest(newTicket);
      requestPrintState.finish();
      console.debug("Print requested successfully:", newTicket);

      onClose();
    } catch (error) {
      await requestPrintState.fail(error as Error, {
        default: () => toast.error(messages.printError),
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
        data-testid="submissions-page-action-print"
      >
        <DownloadIcon />
        <FormattedMessage {...messages.printLabel} />
      </DropdownMenuItem>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        title={messages.confirmTitle}
        description={messages.confirmDescription}
        onCancel={() => setIsDialogOpen(false)}
        onConfirm={() => requestPrint()}
        isLoading={requestPrintState.isLoading}
      />
    </>
  );
}
