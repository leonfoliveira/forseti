import { screen } from "@testing-library/dom";

import { SubmissionStatusBadge } from "@/app/_lib/component/display/badge/submission-status-badge";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionStatusBadge", () => {
  it.each([
    [SubmissionStatus.JUDGING, "Judging", "badge-judging"],
    [SubmissionStatus.FAILED, "Failed", "badge-failed"],
    [SubmissionStatus.JUDGED, "Judged", "badge-judged"],
  ])(
    "renders %s status with correct color",
    async (status, expectedText, expectedTestId) => {
      await renderWithProviders(<SubmissionStatusBadge status={status} />);

      const badge = screen.getByTestId(expectedTestId);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(expectedText);
    },
  );
});
