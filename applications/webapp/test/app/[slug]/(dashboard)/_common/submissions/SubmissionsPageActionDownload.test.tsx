import { act, fireEvent, screen, waitFor } from "@testing-library/react";

import { useToast } from "@/app/_lib/hook/useToast";
import { SubmissionsPageActionDownload } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionDownload";
import { Composition } from "@/config/composition";
import {
  MockContestResponseDTO,
  MockSubmissionWithCodeResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionDownload", () => {
  it("downloads the code attachment and closes the menu", async () => {
    const contest = MockContestResponseDTO();
    const onClose = jest.fn();
    (Composition.attachmentReader.download as jest.Mock).mockResolvedValue(
      new File(["code"], "solution.cpp"),
    );

    await renderWithProviders(
      <SubmissionsPageActionDownload
        submission={MockSubmissionWithCodeResponseDTO()}
        onClose={onClose}
      />,
      { contest },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("submissions-page-action-download"));
    });

    expect(Composition.attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      MockSubmissionWithCodeResponseDTO().code,
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("shows toast on download failure", async () => {
    const error = new Error("Failed to download attachment");
    (Composition.attachmentReader.download as jest.Mock).mockRejectedValueOnce(
      error,
    );
    const submission = MockSubmissionWithCodeResponseDTO();
    const contest = MockContestResponseDTO();

    await renderWithProviders(
      <SubmissionsPageActionDownload
        submission={submission}
        onClose={jest.fn()}
      />,
      { contest },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("submissions-page-action-download"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });
});
