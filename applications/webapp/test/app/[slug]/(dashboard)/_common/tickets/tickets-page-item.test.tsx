import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { TicketsPageItem } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page-item";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { attachmentReader, ticketWritter } from "@/config/composition";
import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("TicketsPageItem", () => {
  it("should render ticket details", async () => {
    const ticket = MockTicketResponseDTO();
    await renderWithProviders(<TicketsPageItem ticket={ticket} />);

    expect(screen.getByTestId("ticket-member-name")).toHaveTextContent(
      ticket.member.name,
    );
    expect(screen.getByTestId("ticket-member-type")).not.toBeEmptyDOMElement();
    expect(screen.getByTestId("ticket-description")).toHaveTextContent(
      (ticket.properties as { description: string }).description,
    );
    expect(screen.getByTestId("ticket-created-at")).toHaveTextContent(
      "01/01/2025, 10:00:00 AM",
    );
    expect(screen.queryByTestId("ticket-staff-name")).toHaveTextContent(
      ticket.staff?.name || "",
    );
    expect(screen.queryByTestId("ticket-updated-at")).toHaveTextContent(
      "01/01/2025, 10:00:00 AM",
    );

    expect(
      screen.queryByTestId("print-attachment-button"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("move-ticket-button")).not.toBeInTheDocument();
  });

  it("should render default description for submission print ticket", async () => {
    const ticket = MockTicketResponseDTO({
      type: TicketType.SUBMISSION_PRINT,
      properties: {
        attachmentId: "attachment-id",
        submissionId: "submission-id",
      },
    });
    await renderWithProviders(<TicketsPageItem ticket={ticket} />);

    expect(screen.getByTestId("ticket-description")).toHaveTextContent(
      "Please, print my submission",
    );
  });

  it("should print attachment when print button is clicked", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const ticket = MockTicketResponseDTO({
      type: TicketType.SUBMISSION_PRINT,
      properties: {
        attachmentId: "attachment-id",
        submissionId: "submission-id",
      },
    });
    await renderWithProviders(<TicketsPageItem ticket={ticket} canEdit />, {
      contestMetadata,
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("print-attachment-button"));
    });

    expect(attachmentReader.print).toHaveBeenCalledWith(contestMetadata.id, {
      attachmentId: "attachment-id",
    });
  });

  it("should show error toast when print attachment fails", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const ticket = MockTicketResponseDTO({
      type: TicketType.SUBMISSION_PRINT,
      properties: {
        attachmentId: "attachment-id",
        submissionId: "submission-id",
      },
    });
    (attachmentReader.print as jest.Mock).mockRejectedValueOnce(
      new Error("Print failed"),
    );
    await renderWithProviders(<TicketsPageItem ticket={ticket} canEdit />, {
      contestMetadata,
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("print-attachment-button"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });

  it("should update ticket status when move button is clicked", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const ticket = MockTicketResponseDTO({
      type: TicketType.TECHNICAL_SUPPORT,
      properties: {
        description: "I need help with my submission",
      },
    });
    const updatedTicket = MockTicketResponseDTO();
    (ticketWritter.updateStatus as jest.Mock).mockResolvedValueOnce(
      updatedTicket,
    );
    const onEdit = jest.fn();

    await renderWithProviders(
      <TicketsPageItem ticket={ticket} canEdit onEdit={onEdit} />,
      {
        contestMetadata,
      },
    );

    fireEvent.click(screen.getByTestId("move-ticket-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("move-ticket-button-resolved"));
    });

    expect(ticketWritter.updateStatus).toHaveBeenCalledWith(
      contestMetadata.id,
      ticket.id,
      TicketStatus.RESOLVED,
    );
    expect(onEdit).toHaveBeenCalledWith(updatedTicket);
  });

  it("should show error toast when update ticket status fails", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const ticket = MockTicketResponseDTO({
      type: TicketType.TECHNICAL_SUPPORT,
      properties: {
        description: "I need help with my submission",
      },
    });
    (ticketWritter.updateStatus as jest.Mock).mockRejectedValueOnce(
      new Error("Update failed"),
    );

    await renderWithProviders(<TicketsPageItem ticket={ticket} canEdit />, {
      contestMetadata,
    });

    fireEvent.click(screen.getByTestId("move-ticket-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("move-ticket-button-resolved"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });
});
