import { act, fireEvent, screen } from "@testing-library/react";

import { SubmissionsPageActionResubmit } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionResubmit";
import {
  MockContestResponseDTO,
  MockSubmissionWithCodeAndExecutionsResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
import { Composition } from "@/config/composition";
import { useToast } from "@/app/_lib/hook/useToast";

describe("SubmissionsPageActionResubmit", () => {
  it("resubmits successfully", async () => {
    const contest = MockContestResponseDTO();
    const submission = MockSubmissionWithCodeAndExecutionsResponseDTO();
    const onClose = jest.fn();
    const onResubmit = jest.fn();
    const updatedSubmission = MockSubmissionWithCodeAndExecutionsResponseDTO();
    (Composition.submissionWriter.resubmit as jest.Mock).mockResolvedValueOnce(
      updatedSubmission,
    );

    await renderWithProviders(
      <SubmissionsPageActionResubmit
        submission={submission}
        onClose={onClose}
        onResubmit={onResubmit}
      />,
      { contest },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(Composition.submissionWriter.resubmit).toHaveBeenCalledWith(
      contest.id,
      submission.id,
    );
    expect(onResubmit).toHaveBeenCalledWith(updatedSubmission);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows toast on resubmit failure", async () => {
    const error = new Error("Failed to resubmit submission");
    (Composition.submissionWriter.resubmit as jest.Mock).mockRejectedValueOnce(
      error,
    );
    const contest = MockContestResponseDTO();
    const submission = MockSubmissionWithCodeAndExecutionsResponseDTO();
    const onClose = jest.fn();
    const onResubmit = jest.fn();

    await renderWithProviders(
      <SubmissionsPageActionResubmit
        submission={submission}
        onClose={onClose}
        onResubmit={onResubmit}
      />,
      { contest },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });
});
