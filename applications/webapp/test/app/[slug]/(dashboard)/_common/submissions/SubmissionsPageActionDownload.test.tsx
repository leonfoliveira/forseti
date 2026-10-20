import { act, fireEvent, screen, waitFor } from "@testing-library/react";

import { SubmissionsPageActionDownload } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionDownload";
import { Composition } from "@/config/composition";
import {
  MockSubmissionWithCodeResponseDTO,
  MockContestResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionDownload", () => {
  it("downloads the code attachment and closes the menu", async () => {
    const contest = MockContestResponseDTO();
    const onClose = jest.fn();
    jest
      .mocked(Composition.attachmentReader.download)
      .mockResolvedValue(new File(["code"], "solution.cpp"));
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
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
