import { render, screen } from "@testing-library/react";

import { GuestSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/GuestSubmissionsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockGuestDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage", () => ({
  SubmissionsPage: (props: { submissions: unknown[]; problems: unknown[] }) => (
    <div data-testid="submission-props">{`${props.submissions.length}:${props.problems.length}`}</div>
  ),
}));

describe("GuestSubmissionsPage", () => {
  it("passes guest submission and problem data to the shared view", async () => {
    await renderWithProviders(<GuestSubmissionsPage />, {
      guestDashboard: MockGuestDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("submission-props")).toHaveTextContent("1:1");
  });
});
