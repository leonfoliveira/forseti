import { act, fireEvent, screen } from "@testing-library/react";

import { SubmissionsPageActionCreatePrintRequest } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionCreatePrintRequest";
import {
  MockPrintRequestResponseDTO,
  MockSubmissionWithCodeResponseDTO,
  MockContestResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
import { Composition } from "@/config/composition";

jest.mock("@/app/_lib/component/feedback/ConfirmationDialog", () => ({
  ConfirmationDialog: ({
    isOpen,
    title,
    onConfirm,
  }: {
    isOpen: boolean;
    title: string;
    onConfirm: () => void;
  }) => (
    <div
      data-testid="confirmation"
      data-open={String(isOpen)}
      onClick={onConfirm}
    >
      {title}
    </div>
  ),
}));

describe("SubmissionsPageActionCreatePrintRequest", () => {
  it("should create print request successfully", async () => {
    const printRequest = MockPrintRequestResponseDTO();
    (Composition.printRequestWriter.create as jest.Mock).mockResolvedValueOnce(
      printRequest,
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

    expect(screen.getByTestId("confirmation")).toHaveAttribute(
      "data-open",
      "false",
    );
    fireEvent.click(
      screen.getByTestId("submissions-page-action-create-print-request"),
    );
    expect(screen.getByTestId("confirmation")).toHaveAttribute(
      "data-open",
      "true",
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation"));
    });

    expect(Composition.printRequestWriter.create).toHaveBeenCalledWith(
      contest.id,
      {
        submissionId: submission.id,
      },
    );
  });
});
