import { screen } from "@testing-library/dom";

import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestStatusChip } from "@/lib/component/chip/contest-status-chip";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ContestStatusChip", () => {
  it.each([
    [ContestStatus.IN_PROGRESS, "In Progress", "chip-in-progress"],
    [ContestStatus.ENDED, "Ended", "chip-ended"],
    [ContestStatus.NOT_STARTED, "Not Started", "chip-not-started"],
  ])(
    "renders %s status with correct color",
    async (status, expectedText, expectedTestId) => {
      await renderWithProviders(<ContestStatusChip status={status} />);

      const chip = screen.getByTestId(expectedTestId);
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveTextContent(expectedText);
    },
  );
});
