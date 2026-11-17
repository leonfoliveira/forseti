import { screen } from "@testing-library/react";

import { ContestStatusBadge } from "@/app/_lib/component/display/badge/ContestStatusBadge";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ContestStatusBadge", () => {
  it.each([
    [ContestStatus.IN_PROGRESS, "In Progress", "badge-in-progress"],
    [ContestStatus.ENDED, "Ended", "badge-ended"],
    [ContestStatus.NOT_STARTED, "Not Started", "badge-not-started"],
  ])("shows %s status", async (status, label, testId) => {
    await renderWithProviders(<ContestStatusBadge status={status} />);
    expect(screen.getByTestId(testId)).toHaveTextContent(label);
  });
});
