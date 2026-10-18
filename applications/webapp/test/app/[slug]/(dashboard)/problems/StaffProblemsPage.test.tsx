import { screen } from "@testing-library/react";

import { StaffProblemsPage } from "@/app/[slug]/(dashboard)/problems/StaffProblemsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/ProblemsPage", () => ({
  ProblemsPage: ({ problems }: { problems: unknown[] }) => (
    <div data-testid="problem-count">{problems.length}</div>
  ),
}));

describe("StaffProblemsPage", () => {
  it("passes the guest problem list to the shared view", async () => {
    await renderWithProviders(<StaffProblemsPage />, {
      staffDashboard: MockStaffDashboardResponseDTO(),
    });
    expect(screen.getByTestId("problem-count")).toHaveTextContent("1");
  });
});
