import { act, fireEvent, screen } from "@testing-library/react";

import { useToast } from "@/app/_lib/hook/useToast";
import { SubmissionsPageActionCreatePrintRequest } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionCreatePrintRequest";
import { Composition } from "@/config/composition";
import {
  MockContestResponseDTO,
  MockPrintRequestResponseDTO,
  MockSubmissionWithCodeResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionCreatePrintRequest", () => {
  it("should create print request successfully", async () => {
    const printRequest = MockPrintRequestResponseDTO();
    (Composition.printRequestWriter.create as jest.Mock).mockResolvedValueOnce(
      printRequest,
    );
    const submission = MockSubmissionWithCodeResponseDTO();
    const contest = MockContestResponseDTO();
    const onClose = jest.fn();

    await renderWithProviders(
      <SubmissionsPageActionCreatePrintRequest
        submission={submission}
        onCreatePrintRequest={jest.fn()}
        onClose={onClose}
      />,
      {
        contest,
      },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(Composition.printRequestWriter.create).toHaveBeenCalledWith(
      contest.id,
      {
        submissionId: submission.id,
      },
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("shows toast on creation failure", async () => {
    const error = new Error("Failed to create print request");
    (Composition.printRequestWriter.create as jest.Mock).mockRejectedValueOnce(
      error,
    );
    const submission = MockSubmissionWithCodeResponseDTO();
    const contest = MockContestResponseDTO();

    await renderWithProviders(
      <SubmissionsPageActionCreatePrintRequest
        submission={submission}
        onCreatePrintRequest={jest.fn()}
        onClose={jest.fn()}
      />,
      {
        contest,
      },
    );

    await act(async () => {
      fireEvent.click(
        screen.getByTestId("submissions-page-action-create-print-request"),
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });
});
