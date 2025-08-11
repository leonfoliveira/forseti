import { render, screen } from "@testing-library/react";

import { ProblemStatusBadge } from "@/app/_component/badge/problem-status-badge";

jest.mock("@/app/_component/badge/badge", () => ({
  Badge: ({ children, className }: any) => (
    <span className={className} data-testid="badge">
      {children}
    </span>
  ),
}));

jest.mock("@/app/_component/format/formatted-datetime", () => ({
  FormattedDateTime: ({ timestamp }: any) => timestamp,
}));

describe("ProblemStatusBadge", () => {
  it.each([
    [true, "2025-01-01T00:00:00Z", 0, "badge-success", "2025-01-01T00:00:00Z"],
    [
      true,
      "2025-01-01T00:00:00Z",
      1,
      "badge-success",
      "2025-01-01T00:00:00Z | +1",
    ],
    [false, undefined, 1, "badge-error", "+1"],
  ])(
    "should render with correct class and content",
    (
      isAccepted,
      acceptedAt,
      wrongSubmissions,
      expectedClass,
      expectedContent
    ) => {
      render(
        <ProblemStatusBadge
          isAccepted={isAccepted}
          acceptedAt={acceptedAt}
          wrongSubmissions={wrongSubmissions}
        />
      );

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass(expectedClass);
      expect(badge).toHaveTextContent(expectedContent);
    }
  );

  it("should not render when not accepted and no wrong submissions", () => {
    const { container } = render(
      <ProblemStatusBadge isAccepted={false} wrongSubmissions={0} />
    );
    expect(container.firstChild).toBeNull();
  });
});
