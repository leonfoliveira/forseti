import { screen } from "@testing-library/dom";

import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionStatusChip } from "@/lib/component/chip/submission-status-chip";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionStatusChip", () => {
  it.each([
    [SubmissionStatus.JUDGING, "Judging", "chip-judging"],
    [SubmissionStatus.FAILED, "Failed", "chip-failed"],
    [SubmissionStatus.JUDGED, "Judged", "chip-judged"],
  ])(
    "renders %s status with correct color",
    async (status, expectedText, expectedTestId) => {
      await renderWithProviders(<SubmissionStatusChip status={status} />);

      const chip = screen.getByTestId(expectedTestId);
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveTextContent(expectedText);
    },
  );
});
