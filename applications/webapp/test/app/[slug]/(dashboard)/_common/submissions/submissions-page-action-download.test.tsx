import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { SubmissionsPageActionDownload } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-download";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/app/_lib/component/shadcn/dropdown-menu";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Composition } from "@/config/composition";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockSubmissionWithCodeResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionDownload", () => {
  it("should call attachmentReader.download with correct parameters when clicked", async () => {
    const contest = MockContestResponseDTO();
    const submission = MockSubmissionWithCodeResponseDTO();
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
      { contest },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("submissions-page-action-download"));
    });

    expect(Composition.attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      submission.code,
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("should show error toast when download fails", async () => {
    const contest = MockContestResponseDTO();
    const submission = MockSubmissionWithCodeResponseDTO();
    const onClose = jest.fn();
    const error = new Error("Download failed");
    (Composition.attachmentReader.download as jest.Mock).mockRejectedValueOnce(
      error,
    );

    await renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuContent>
          <SubmissionsPageActionDownload
            submission={submission}
            onClose={onClose}
          />
        </DropdownMenuContent>
      </DropdownMenu>,
      { contest },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("submissions-page-action-download"));
    });

    expect(useToast().error).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
