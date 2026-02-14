import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { SubmissionsPageActionDownload } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-download";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/app/_lib/component/shadcn/dropdown-menu";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { attachmentReader } from "@/config/composition";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionDownload", () => {
  it("should call attachmentReader.download with correct parameters when clicked", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const submission = MockSubmissionFullResponseDTO();
    const onClose = jest.fn();
    await renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuContent>
          <SubmissionsPageActionDownload
            submission={submission}
            onClose={onClose}
          />
        </DropdownMenuContent>
      </DropdownMenu>,
      { contestMetadata },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("submissions-page-action-download"));
    });

    expect(attachmentReader.download).toHaveBeenCalledWith(
      contestMetadata.id,
      submission.code,
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("should show error toast when download fails", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const submission = MockSubmissionFullResponseDTO();
    const onClose = jest.fn();
    const error = new Error("Download failed");
    (attachmentReader.download as jest.Mock).mockRejectedValueOnce(error);

    await renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuContent>
          <SubmissionsPageActionDownload
            submission={submission}
            onClose={onClose}
          />
        </DropdownMenuContent>
      </DropdownMenu>,
      { contestMetadata },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("submissions-page-action-download"));
    });

    expect(useToast().error).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
