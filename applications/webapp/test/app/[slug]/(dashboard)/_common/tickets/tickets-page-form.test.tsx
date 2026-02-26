import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { TicketsPageForm } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page-form";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Composition } from "@/config/composition";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("TicketsPageForm", () => {
  it("should render form fields and submit button", async () => {
    const onCreate = jest.fn();
    const onClose = jest.fn();
    await renderWithProviders(
      <TicketsPageForm onClose={onClose} onCreate={onCreate} />,
    );

    expect(screen.getByTestId("ticket-form")).toBeInTheDocument();
    expect(screen.getByTestId("ticket-form-type")).toBeInTheDocument();
    expect(screen.getByTestId("ticket-form-description")).toBeInTheDocument();
    expect(screen.getByTestId("ticket-form-cancel")).toBeInTheDocument();
    expect(screen.getByTestId("ticket-form-submit")).toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = jest.fn();
    const onCreate = jest.fn();
    await renderWithProviders(
      <TicketsPageForm onClose={onClose} onCreate={onCreate} />,
    );

    screen.getByTestId("ticket-form-cancel").click();
    expect(onClose).toHaveBeenCalled();
  });

  it("should create ticket when submit button is clicked", async () => {
    const newTicket = MockTicketResponseDTO();
    (Composition.ticketWritter.create as jest.Mock).mockResolvedValueOnce(
      newTicket,
    );
    const contest = MockContestResponseDTO();

    const onClose = jest.fn();
    const onCreate = jest.fn();
    await renderWithProviders(
      <TicketsPageForm onClose={onClose} onCreate={onCreate} />,
      { contest },
    );

    fireEvent.change(screen.getByTestId("ticket-form-type"), {
      target: { value: TicketType.TECHNICAL_SUPPORT },
    });
    fireEvent.change(screen.getByTestId("ticket-form-description"), {
      target: { value: "Test ticket description" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("ticket-form-submit"));
    });

    expect(Composition.ticketWritter.create).toHaveBeenCalledWith(contest.id, {
      type: TicketType.TECHNICAL_SUPPORT,
      properties: {
        description: "Test ticket description",
      },
    });
    expect(onCreate).toHaveBeenCalledWith(newTicket);
    expect(onClose).toHaveBeenCalled();
  });

  it("should show error toast when ticket creation fails", async () => {
    (Composition.ticketWritter.create as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to create ticket"),
    );

    const onClose = jest.fn();
    const onCreate = jest.fn();
    await renderWithProviders(
      <TicketsPageForm onClose={onClose} onCreate={onCreate} />,
    );

    fireEvent.change(screen.getByTestId("ticket-form-type"), {
      target: { value: TicketType.TECHNICAL_SUPPORT },
    });
    fireEvent.change(screen.getByTestId("ticket-form-description"), {
      target: { value: "Test ticket description" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("ticket-form-submit"));
    });

    expect(Composition.ticketWritter.create).toHaveBeenCalled();
    expect(onCreate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(useToast().error).toHaveBeenCalled();
  });
});
