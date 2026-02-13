import { Download } from "lucide-react";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useErrorHandler } from "@/app/_lib/hook/error-handler-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { attachmentReader } from "@/config/composition";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  downloadLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-download.download-label",
    defaultMessage: "Download",
  },
  downloadError: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-download.download-error",
    defaultMessage: "Failed to download submission. Please try again.",
  },
});

type Props = {
  submission: SubmissionFullResponseDTO;
  onClose: () => void;
};

export function SubmissionsPageActionDownload({ submission, onClose }: Props) {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const errorHandler = useErrorHandler();
  const toast = useToast();

  async function downloadSubmission() {
    try {
      await attachmentReader.download(contestId, submission.code);
      onClose();
    } catch (error) {
      errorHandler.handle(error as Error, {
        default: () => toast.error(messages.downloadError),
      });
    }
  }

  return (
    <DropdownMenuItem
      onClick={(e) => {
        e.preventDefault();
        downloadSubmission();
      }}
      data-testid="submissions-page-action-download"
    >
      <Download />
      <FormattedMessage {...messages.downloadLabel} />
    </DropdownMenuItem>
  );
}
