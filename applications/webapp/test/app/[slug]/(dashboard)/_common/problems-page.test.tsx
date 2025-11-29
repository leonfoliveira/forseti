import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems-page";
import { attachmentReader } from "@/config/composition";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ProblemsPage", () => {
  const contestMetadata = MockContestMetadataResponseDTO();
  const problems = [MockProblemPublicResponseDTO()];

  it("should render variant without status", async () => {
    await renderWithProviders(<ProblemsPage problems={problems} />, {
      contestMetadata,
    });

    expect(document.title).toBe("Forseti - Problems");
    expect(screen.getByTestId("problem-letter")).toHaveTextContent("A");
    expect(screen.getByTestId("problem-title")).toHaveTextContent(
      "Test Problem",
    );
    expect(screen.queryByTestId("problem-status")).not.toBeInTheDocument();
    expect(screen.getByTestId("problem-download")).toBeEnabled();
  });

  it("should render variant with status", async () => {
    await renderWithProviders(
      <ProblemsPage
        problems={problems}
        contestantClassificationProblems={[
          {
            id: problems[0].id,
            letter: "A",
            isAccepted: true,
            acceptedAt: "2025-01-01T00:00:00Z",
            wrongSubmissions: 0,
            penalty: 1000,
          },
        ]}
      />,
      { contestMetadata },
    );

    expect(screen.getByTestId("problem-letter")).toHaveTextContent("A");
    expect(screen.getByTestId("problem-title")).toHaveTextContent(
      "Test Problem",
    );
    expect(screen.getByTestId("problem-status")).toHaveTextContent("00:00:00");
    expect(screen.getByTestId("problem-download")).toBeEnabled();
  });

  it("should handle download problem description", async () => {
    await renderWithProviders(<ProblemsPage problems={problems} />, {
      contestMetadata,
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("problem-download"));
    });
    expect(attachmentReader.download).toHaveBeenCalledWith(
      contestMetadata.id,
      problems[0].description,
    );
  });
});
