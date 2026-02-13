import { Download } from "lucide-react";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useAppSelector } from "@/app/_store/store";
import { attachmentReader } from "@/config/composition";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  downloadLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-download.download-label",
    defaultMessage: "Download",
  },
});

type Props = {
  submission: SubmissionFullResponseDTO;
  onClose: () => void;
};

export function SubmissionsPageActionDownload({ submission, onClose }: Props) {
  const contestId = useAppSelector((state) => state.contestMetadata.id);

  async function downloadSubmission() {
    await attachmentReader.download(contestId, submission.code);
    onClose();
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
