import { screen } from "@testing-library/react";

import { ProblemStatusBadge } from "@/app/_lib/component/display/badge/ProblemStatusBadge";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ProblemStatusBadge", () => {
  it("shows accepted solve time and wrong submission count", async () => {
    await renderWithProviders(<ProblemStatusBadge isAccepted wrongSubmissions={2} acceptedAt="2026-01-01T00:30:00Z" />);
    expect(screen.getByTestId("badge-accepted")).toHaveTextContent("30 (+2)");
  });

  it("shows wrong attempts only when there is no accepted result", async () => {
    await renderWithProviders(<ProblemStatusBadge isAccepted={false} wrongSubmissions={3} />);
    expect(screen.getByTestId("badge-rejected")).toHaveTextContent("+3");
  });

  it("renders no badge when there are no submissions", async () => {
    await renderWithProviders(<ProblemStatusBadge isAccepted={false} wrongSubmissions={0} />);
    expect(screen.queryByTestId("badge-accepted")).toBeNull();
    expect(screen.queryByTestId("badge-rejected")).toBeNull();
  });
});
