import { screen } from "@testing-library/dom";

import { ProblemStatusChip } from "@/lib/component/chip/problem-status-chip";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ProblemStatusChip", () => {
  it("should render chip correctly when is accepted without wrong submissions", async () => {
    await renderWithProviders(
      <ProblemStatusChip
        isAccepted
        acceptedAt="2025-01-01T00:00:00Z"
        wrongSubmissions={0}
      />,
      { contestMetadata: MockContestMetadataResponseDTO() },
    );

    const chip = screen.getByTestId("chip-accepted");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent("00:00:00");
  });

  it("should render chip correctly when is accepted with wrong submissions", async () => {
    await renderWithProviders(
      <ProblemStatusChip
        isAccepted
        acceptedAt="2025-01-01T00:00:00Z"
        wrongSubmissions={2}
      />,
      { contestMetadata: MockContestMetadataResponseDTO() },
    );

    const chip = screen.getByTestId("chip-accepted");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent("00:00:00 +2");
  });

  it("should render chip correctly when is not accepted with wrong submissions", async () => {
    await renderWithProviders(
      <ProblemStatusChip isAccepted={false} wrongSubmissions={3} />,
      { contestMetadata: MockContestMetadataResponseDTO() },
    );

    const chip = screen.getByTestId("chip-rejected");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent("+3");
  });

  it("should not render chip when is not accepted and no wrong submissions", async () => {
    await renderWithProviders(
      <ProblemStatusChip isAccepted={false} wrongSubmissions={0} />,
      { contestMetadata: MockContestMetadataResponseDTO() },
    );

    expect(screen.queryByTestId("chip-accepted")).not.toBeInTheDocument();
    expect(screen.queryByTestId("chip-rejected")).not.toBeInTheDocument();
  });
});
