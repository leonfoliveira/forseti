import { act, fireEvent, screen } from "@testing-library/react";

import { SubmissionsPageActionPrint } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-print";
import { DropdownMenu } from "@/app/_lib/component/shadcn/dropdown-menu";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Composition } from "@/config/composition";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockSubmissionWithCodeResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeResponseDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionPrint", () => {
  it("should request print and show success toast on success", async () => {
    const contest = MockContestResponseDTO();
    const ticket = MockTicketResponseDTO();
    const submission = MockSubmissionWithCodeResponseDTO();
    const onClose = jest.fn();
    const onRequest = jest.fn();
    (Composition.ticketWritter.create as jest.Mock).mockResolvedValue(ticket);

    await renderWithProviders(
      <DropdownMenu open>
        <SubmissionsPageActionPrint
          submission={submission}
          onClose={onClose}
          onRequest={onRequest}
        />
      </DropdownMenu>,
      {
        contest,
      },
    );

    act(() => {
      fireEvent.click(screen.getByTestId("submissions-page-action-print"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(Composition.ticketWritter.create).toHaveBeenCalledWith(contest.id, {
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
    const contest = MockContestResponseDTO();
    const submission = MockSubmissionWithCodeResponseDTO();
    const onClose = jest.fn();
    const onRequest = jest.fn();
    (Composition.ticketWritter.create as jest.Mock).mockRejectedValue(
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
        contest,
      },
    );

    act(() => {
      fireEvent.click(screen.getByTestId("submissions-page-action-print"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(Composition.ticketWritter.create).toHaveBeenCalledWith(contest.id, {
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
