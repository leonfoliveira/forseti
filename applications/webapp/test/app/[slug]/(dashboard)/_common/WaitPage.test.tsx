import { screen } from "@testing-library/react";

import { WaitPage } from "@/app/[slug]/(dashboard)/_common/WaitPage";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("WaitPage", () => {
  it("explains that the contest is not yet available", async () => {
    await renderWithProviders(<WaitPage />, {
      contest: MockContestResponseDTO({ startAt: "2099-01-01T00:00:00Z" }),
    });
    expect(screen.getByTestId("wait-page")).toHaveTextContent(
      "contest has not started yet",
    );
    expect(screen.getByText(/automatically reload/)).toBeInTheDocument();
  });
});
