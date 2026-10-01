import { DownloadIcon } from "lucide-react";

import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useErrorHandler } from "@/app/_lib/hook/useErrorHandler";
import { useToast } from "@/app/_lib/hook/useToast";
import { useAppSelector } from "@/app/_store/Store";
import { Composition } from "@/config/composition";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

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
        default: () => toast.error("Failed to download submission."),
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
      Download
    </DropdownMenuItem>
  );
}
