import { act, fireEvent, screen } from "@testing-library/react";

import { useToast } from "@/app/_lib/hook/useToast";
import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";
import { Composition } from "@/config/composition";
import {
  MockContestResponseDTO,
  MockLeaderboardResponseDTO,
  MockProblemWithTestCasesResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ProblemsPage", () => {
  it("renders problems", async () => {
    const problem = MockProblemWithTestCasesResponseDTO();

    await renderWithProviders(<ProblemsPage problems={[problem]} />, {
      contest: MockContestResponseDTO(),
    });

    expect(screen.getByTestId("problem-letter")).toHaveTextContent(
      problem.letter,
    );
    expect(screen.getByTestId("problem-title")).toHaveTextContent(
      problem.title,
    );
    expect(screen.getByTestId("problem-time-limit")).toHaveTextContent(
      `${problem.timeLimit / 1000}s`,
    );
    expect(screen.getByTestId("problem-memory-limit")).toHaveTextContent(
      `${problem.memoryLimit} MB`,
    );
    expect(screen.getByTestId("problem-download")).toBeEnabled();
  });

  it("downloads description successfully", async () => {
    const contest = MockContestResponseDTO();
    const problem = MockProblemWithTestCasesResponseDTO();

    await renderWithProviders(<ProblemsPage problems={[problem]} />, {
      contest,
    });

    const downloadButton = screen.getByTestId("problem-download");
    await act(async () => {
      fireEvent.click(downloadButton);
    });
    expect(Composition.attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      problem.description,
    );
  });

  it("shows toast on download error", async () => {
    const contest = MockContestResponseDTO();
    const problem = MockProblemWithTestCasesResponseDTO();

    (Composition.attachmentReader.download as jest.Mock).mockRejectedValueOnce(
      new Error("Download failed"),
    );

    await renderWithProviders(<ProblemsPage problems={[problem]} />, {
      contest,
    });

    const downloadButton = screen.getByTestId("problem-download");
    await act(async () => {
      fireEvent.click(downloadButton);
    });
    expect(useToast().error).toHaveBeenCalled();
  });

  it("downloads test cases successfully", async () => {
    const contest = MockContestResponseDTO();
    const problem = MockProblemWithTestCasesResponseDTO();

    await renderWithProviders(
      <ProblemsPage problems={[problem]} canDownloadTestCases />,
      {
        contest,
      },
    );

    const downloadButton = screen.getByTestId("problem-download-test-cases");
    await act(async () => {
      fireEvent.click(downloadButton);
    });
    expect(Composition.attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      problem.testCases,
    );
  });

  it("shows toast on test cases download error", async () => {
    const contest = MockContestResponseDTO();
    const problem = MockProblemWithTestCasesResponseDTO();

    (Composition.attachmentReader.download as jest.Mock).mockRejectedValueOnce(
      new Error("Download failed"),
    );

    await renderWithProviders(
      <ProblemsPage problems={[problem]} canDownloadTestCases />,
      {
        contest,
      },
    );

    const downloadButton = screen.getByTestId("problem-download-test-cases");
    await act(async () => {
      fireEvent.click(downloadButton);
    });
    expect(useToast().error).toHaveBeenCalled();
  });

  it("shows status correctly", async () => {
    const contest = MockContestResponseDTO();
    const problems = [
      MockProblemWithTestCasesResponseDTO(),
      MockProblemWithTestCasesResponseDTO(),
      MockProblemWithTestCasesResponseDTO(),
    ];
    const nonExistingCell = MockLeaderboardResponseDTO().rows[0].cells[0];
    const acceptedCell = {
      ...MockLeaderboardResponseDTO().rows[0].cells[0],
      problemId: problems[0].id,
      isAccepted: true,
    };
    const attemptedCell = {
      ...MockLeaderboardResponseDTO().rows[0].cells[0],
      problemId: problems[1].id,
      isAccepted: false,
      wrongSubmissions: 1,
    };
    const notAttemptedCell = {
      ...MockLeaderboardResponseDTO().rows[0].cells[0],
      problemId: problems[2].id,
      isAccepted: false,
      wrongSubmissions: 0,
    };

    await renderWithProviders(
      <ProblemsPage
        problems={problems}
        leaderboardRow={{
          ...MockLeaderboardResponseDTO().rows[0],
          cells: [
            nonExistingCell,
            acceptedCell,
            attemptedCell,
            notAttemptedCell,
          ],
        }}
      />,
      {
        contest,
      },
    );

    const statusCells = screen.getAllByTestId("problem-status");
    expect(statusCells.length).toBe(3);
    expect(statusCells[0]).toHaveTextContent("Accepted");
    expect(statusCells[1]).toHaveTextContent("1 Attempt(s)");
    expect(statusCells[2]).toHaveTextContent("Not Attempted");
  });
});
