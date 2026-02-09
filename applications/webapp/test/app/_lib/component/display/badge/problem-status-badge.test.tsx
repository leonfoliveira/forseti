import { screen } from "@testing-library/dom";

import { ProblemStatusBadge } from "@/app/_lib/component/display/badge/problem-status-badge";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ProblemStatusBadge", () => {
  it("should render badge correctly when is accepted without wrong submissions", async () => {
    await renderWithProviders(
      <ProblemStatusBadge
        isAccepted
        acceptedAt="2025-01-01T00:00:00Z"
        wrongSubmissions={0}
      />,
      { contestMetadata: MockContestMetadataResponseDTO() },
    );

    const badge = screen.getByTestId("badge-accepted");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("0");
  });

  it("should render badge correctly when is accepted with wrong submissions", async () => {
    await renderWithProviders(
      <ProblemStatusBadge
        isAccepted
        acceptedAt="2025-01-01T00:00:00Z"
        wrongSubmissions={2}
      />,
      { contestMetadata: MockContestMetadataResponseDTO() },
    );

    const badge = screen.getByTestId("badge-accepted");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("0 (+2)");
  });

  it("should render badge correctly when is not accepted with wrong submissions", async () => {
    await renderWithProviders(
      <ProblemStatusBadge isAccepted={false} wrongSubmissions={3} />,
      { contestMetadata: MockContestMetadataResponseDTO() },
    );

    const badge = screen.getByTestId("badge-rejected");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("(+3)");
  });

  it("should not render badge when is not accepted and no wrong submissions", async () => {
    await renderWithProviders(
      <ProblemStatusBadge isAccepted={false} wrongSubmissions={0} />,
      { contestMetadata: MockContestMetadataResponseDTO() },
    );

    expect(screen.queryByTestId("badge-accepted")).not.toBeInTheDocument();
    expect(screen.queryByTestId("badge-rejected")).not.toBeInTheDocument();
  });
});
