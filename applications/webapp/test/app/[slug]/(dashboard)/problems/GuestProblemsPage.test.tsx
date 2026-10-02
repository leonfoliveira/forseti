import { render, screen } from "@testing-library/react";

import { GuestProblemsPage } from "@/app/[slug]/(dashboard)/problems/GuestProblemsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockGuestDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/ProblemsPage", () => ({
  ProblemsPage: ({ problems }: { problems: unknown[] }) => (
    <div data-testid="problem-count">{problems.length}</div>
  ),
}));

describe("GuestProblemsPage", () => {
  it("passes the guest problem list to the shared view", async () => {
    await renderWithProviders(<GuestProblemsPage />, {
      guestDashboard: MockGuestDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("problem-count")).toHaveTextContent("1");
  });
});
