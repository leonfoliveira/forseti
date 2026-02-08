import { screen } from "@testing-library/dom";

import { ContestStatusBadge } from "@/app/_lib/component/display/badge/contest-status-badge";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ContestStatusBadge", () => {
  it.each([
    [ContestStatus.IN_PROGRESS, "In Progress", "badge-in-progress"],
    [ContestStatus.ENDED, "Ended", "badge-ended"],
    [ContestStatus.NOT_STARTED, "Not Started", "badge-not-started"],
  ])(
    "renders %s status with correct color",
    async (status, expectedText, expectedTestId) => {
      await renderWithProviders(<ContestStatusBadge status={status} />);

      const badge = screen.getByTestId(expectedTestId);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(expectedText);
    },
  );
});
