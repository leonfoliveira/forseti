import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/problems-page";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Composition } from "@/config/composition";
import { ProblemWithTestCasesResponseDTO } from "@/core/port/dto/response/problem/ProblemWithTestCasesResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ProblemsPage", () => {
  const contest = MockContestResponseDTO();
  const problems = [MockProblemResponseDTO()];

  it("should render variant without test cases and status", async () => {
    await renderWithProviders(<ProblemsPage problems={problems} />, {
      contest,
    });

    expect(document.title).toBe("Forseti - Problems");
    expect(screen.getByTestId("problem-letter")).toHaveTextContent("A");
    expect(screen.getByTestId("problem-title")).toHaveTextContent(
      "Test Problem",
    );
    expect(
      screen.queryByTestId("problem-download-test-cases"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("problem-status")).not.toBeInTheDocument();
    expect(screen.getByTestId("problem-download-description")).toBeEnabled();
  });

  it("should render variant with test cases", async () => {
    await renderWithProviders(
      <ProblemsPage problems={problems} canDownloadTestCases />,
      {
        contest,
      },
    );

    expect(document.title).toBe("Forseti - Problems");
    expect(screen.getByTestId("problem-letter")).toHaveTextContent("A");
    expect(screen.getByTestId("problem-title")).toHaveTextContent(
      "Test Problem",
    );
    expect(screen.getByTestId("problem-download-test-cases")).toBeEnabled();
    expect(screen.queryByTestId("problem-status")).not.toBeInTheDocument();
    expect(screen.getByTestId("problem-download-description")).toBeEnabled();
  });

  it("should handle download problem test cases", async () => {
    await renderWithProviders(
      <ProblemsPage problems={problems} canDownloadTestCases />,
      {
        contest,
      },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("problem-download-test-cases"));
    });
    expect(Composition.attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      (problems[0] as ProblemWithTestCasesResponseDTO).testCases,
    );
  });

  it("should handle download problem test cases error", async () => {
    (Composition.attachmentReader.download as jest.Mock).mockRejectedValueOnce(
      new Error("Download failed"),
    );

    await renderWithProviders(
      <ProblemsPage problems={problems} canDownloadTestCases />,
      {
        contest,
      },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("problem-download-test-cases"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });

  it("should render variant with status", async () => {
    const leaderboard = MockLeaderboardResponseDTO();
    leaderboard.rows[0].cells[0].problemId = problems[0].id;
    await renderWithProviders(
      <ProblemsPage problems={problems} leaderboardRow={leaderboard.rows[0]} />,
      { contest },
    );

    expect(screen.getByTestId("problem-letter")).toHaveTextContent("A");
    expect(screen.getByTestId("problem-title")).toHaveTextContent(
      "Test Problem",
    );
    expect(screen.getByTestId("problem-status")).toHaveTextContent("Accepted");
    expect(screen.getByTestId("problem-download-description")).toBeEnabled();
  });

  it("should handle download problem description", async () => {
    await renderWithProviders(<ProblemsPage problems={problems} />, {
      contest,
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("problem-download"));
    });
    expect(Composition.attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      problems[0].description,
    );
  });

  it("should handle download problem description error", async () => {
    (Composition.attachmentReader.download as jest.Mock).mockRejectedValueOnce(
      new Error("Download failed"),
    );

    await renderWithProviders(<ProblemsPage problems={problems} />, {
      contest,
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("problem-download"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });
});
