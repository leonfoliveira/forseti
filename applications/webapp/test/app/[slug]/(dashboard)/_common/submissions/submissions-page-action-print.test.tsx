import { act, fireEvent, screen } from "@testing-library/react";

import { SubmissionsPageActionPrint } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-print";
import { DropdownMenu } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { ticketWritter } from "@/config/composition";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionPrint", () => {
  it("should request print and show success toast on success", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const ticket = MockTicketResponseDTO();
    const submission = MockSubmissionFullResponseDTO();
    const onClose = jest.fn();
    const onRequest = jest.fn();
    (ticketWritter.create as jest.Mock).mockResolvedValue(ticket);

    await renderWithProviders(
      <DropdownMenu open>
        <SubmissionsPageActionPrint
          submission={submission}
          onClose={onClose}
          onRequest={onRequest}
        />
      </DropdownMenu>,
      {
        contestMetadata,
      },
    );

    act(() => {
      fireEvent.click(screen.getByTestId("submissions-page-action-print"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(ticketWritter.create).toHaveBeenCalledWith(contestMetadata.id, {
      type: TicketType.SUBMISSION_PRINT,
      properties: {
        submissionId: submission.id,
        attachmentId: submission.code.id,
      },
    });
    expect(onRequest).toHaveBeenCalledWith(ticket);
    expect(onClose).toHaveBeenCalled();
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should show error toast on failure", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const submission = MockSubmissionFullResponseDTO();
    const onClose = jest.fn();
    const onRequest = jest.fn();
    (ticketWritter.create as jest.Mock).mockRejectedValue(
      new Error("Failed to request print"),
    );

    await renderWithProviders(
      <DropdownMenu open>
        <SubmissionsPageActionPrint
          submission={submission}
          onClose={onClose}
          onRequest={onRequest}
        />
      </DropdownMenu>,
      {
        contestMetadata,
      },
    );

    act(() => {
      fireEvent.click(screen.getByTestId("submissions-page-action-print"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(ticketWritter.create).toHaveBeenCalledWith(contestMetadata.id, {
      type: TicketType.SUBMISSION_PRINT,
      properties: {
        submissionId: submission.id,
        attachmentId: submission.code.id,
      },
    });
    expect(onRequest).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(useToast().error).toHaveBeenCalled();
  });
});
