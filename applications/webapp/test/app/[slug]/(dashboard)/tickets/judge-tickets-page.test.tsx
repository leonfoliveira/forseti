import { TicketsPage } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page";
import { JudgeTicketsPage } from "@/app/[slug]/(dashboard)/tickets/judge-tickets-page";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/tickets/tickets-page", () => ({
  TicketsPage: jest.fn(),
}));

describe("JudgeTicketsPage", () => {
  it("should render common TicketsPage with correct data", async () => {
    const memberTickets = [MockTicketResponseDTO()];
    await renderWithProviders(<JudgeTicketsPage />, {
      judgeDashboard: {
        memberTickets,
      },
    } as any);

    expect(TicketsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        tickets: memberTickets,
        canCreate: true,
        onCreate: expect.any(Function),
      }),
      undefined,
    );
  });
});
