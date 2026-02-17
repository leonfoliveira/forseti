import { act, fireEvent, screen, within } from "@testing-library/react";

import { TicketsPage } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page";
import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("TicketsPage", () => {
  it("renders tickets in the correct columns based on their status", async () => {
    const tickets = [
      MockTicketResponseDTO({
        status: TicketStatus.OPEN,
      }),
      MockTicketResponseDTO({
        status: TicketStatus.IN_PROGRESS,
      }),
      MockTicketResponseDTO({
        status: TicketStatus.RESOLVED,
      }),
    ];

    await renderWithProviders(<TicketsPage tickets={tickets} />);

    const openColumn = screen.getByTestId("ticket-column-open");
    const inProgressColumn = screen.getByTestId("ticket-column-in_progress");
    const resolvedColumn = screen.getByTestId("ticket-column-resolved");

    expect(within(openColumn).getAllByTestId("ticket-item")).toHaveLength(1);
    expect(within(inProgressColumn).getAllByTestId("ticket-item")).toHaveLength(
      1,
    );
    expect(within(resolvedColumn).getAllByTestId("ticket-item")).toHaveLength(
      1,
    );
  });

  it("renders variant with create button", async () => {
    await renderWithProviders(
      <TicketsPage tickets={[]} canCreate onCreate={() => {}} />,
    );

    expect(screen.queryByTestId("ticket-form")).not.toBeInTheDocument();
    expect(screen.getByTestId("open-create-form-button")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId("open-create-form-button"));
    });

    expect(screen.getByTestId("ticket-form")).toBeInTheDocument();
    expect(
      screen.queryByTestId("open-create-form-button"),
    ).not.toBeInTheDocument();
  });
});
