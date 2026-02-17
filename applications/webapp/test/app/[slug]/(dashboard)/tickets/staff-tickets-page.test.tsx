import { TicketsPage } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page";
import { StaffTicketsPage } from "@/app/[slug]/(dashboard)/tickets/staff-tickets-page";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/tickets/tickets-page", () => ({
  TicketsPage: jest.fn(),
}));

describe("StaffTicketsPage", () => {
  it("should render common TicketsPage with correct data", async () => {
    const tickets = [MockTicketResponseDTO()];
    await renderWithProviders(<StaffTicketsPage />, {
      staffDashboard: {
        tickets,
      },
    } as any);

    expect(TicketsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        tickets,
        canCreate: true,
        onCreate: expect.any(Function),
        canEdit: true,
        onEdit: expect.any(Function),
      }),
      undefined,
    );
  });
});
