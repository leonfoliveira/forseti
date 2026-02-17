import { screen } from "@testing-library/dom";

import { TicketTypeBadge } from "@/app/_lib/component/display/badge/ticket-type-badge";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { renderWithProviders } from "@/test/render-with-providers";

describe("TicketTypeBadge", () => {
  it.each([
    [TicketType.SUBMISSION_PRINT, "Submission Print", "badge-submission-print"],
    [
      TicketType.TECHNICAL_SUPPORT,
      "Technical Support",
      "badge-technical-support",
    ],
    [
      TicketType.NON_TECHNICAL_SUPPORT,
      "Non-Technical Support",
      "badge-non-technical-support",
    ],
  ])(
    "renders %s status with correct color",
    async (type, expectedText, expectedTestId) => {
      await renderWithProviders(<TicketTypeBadge type={type} />);

      const badge = screen.getByTestId(expectedTestId);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(expectedText);
    },
  );
});
