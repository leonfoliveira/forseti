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
};

export function SubmissionsPageActionDownload({ submission }: Props) {
  const contestId = useAppSelector((state) => state.contestMetadata.id);

  return (
    <DropdownMenuItem
      onClick={() =>
        attachmentReader.download(
          contestId,
          (submission as SubmissionFullResponseDTO).code,
        )
      }
      data-testid="submissions-page-action-download"
    >
      <Download />
      <FormattedMessage {...messages.downloadLabel} />
    </DropdownMenuItem>
  );
}
