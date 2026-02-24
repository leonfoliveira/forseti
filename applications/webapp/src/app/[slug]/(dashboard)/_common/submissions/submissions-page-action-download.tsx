import { DownloadIcon } from "lucide-react";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useErrorHandler } from "@/app/_lib/hook/error-handler-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  downloadLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-download.download-label",
    defaultMessage: "Download",
  },
  downloadError: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-download.download-error",
    defaultMessage: "Failed to download submission.",
  },
});

type Props = {
  submission: SubmissionWithCodeResponseDTO;
  onClose: () => void;
};

export function SubmissionsPageActionDownload({ submission, onClose }: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const errorHandler = useErrorHandler();
  const toast = useToast();

  async function downloadSubmission() {
    console.debug("Attempting to download submission with ID:", submission.id);
    try {
      await Composition.attachmentReader.download(contestId, submission.code);

      console.debug(
        "Submission downloaded successfully with ID:",
        submission.id,
      );

      onClose();
    } catch (error) {
      await errorHandler.handle(error as Error, {
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
      <DownloadIcon />
      <FormattedMessage {...messages.downloadLabel} />
    </DropdownMenuItem>
  );
}
