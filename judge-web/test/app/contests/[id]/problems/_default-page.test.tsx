import { render, screen, within } from "@testing-library/react";
import React from "react";
import { useFindAllProblemsAction } from "@/app/_action/find-all-problems-action";
import { DefaultContestProblemsPage } from "@/app/contests/[id]/problems/_default-page";
import { attachmentService } from "@/app/_composition";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(),
}));

jest.mock("@/app/_action/find-all-problems-action", () => ({
  useFindAllProblemsAction: jest.fn(),
}));

jest.mock("@/app/_composition", () => ({
  attachmentService: {
    download: jest.fn(),
  },
}));

const mockUseFindAllProblemsAction = useFindAllProblemsAction as jest.Mock;
const mockDownload = attachmentService.download as jest.Mock;

describe("DefaultContestProblemsPage", () => {
  const contestId = 123;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFindAllProblemsAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: jest.fn(),
    });
  });

  it("renders a spinner when problems data is loading (non-contestant)", () => {
    render(<DefaultContestProblemsPage contestId={contestId} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders a spinner when problems data is loading", () => {
    render(<DefaultContestProblemsPage contestId={contestId} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("calls findAllProblemsAction.act on mount", () => {
    const mockAct = jest.fn();
    mockUseFindAllProblemsAction.mockReturnValue({
      data: [],
      isLoading: false,
      act: mockAct,
    });

    render(<DefaultContestProblemsPage contestId={contestId} />);
    expect(mockAct).toHaveBeenCalledWith(contestId);
  });

  it("renders public problems list when not a contestant", async () => {
    const mockProblems = [
      { id: 1, title: "Problem One", description: { key: "desc1" } },
      { id: 2, title: "Problem Two", description: { key: "desc2" } },
    ];
    mockUseFindAllProblemsAction.mockReturnValue({
      data: mockProblems,
      isLoading: false,
      act: jest.fn(),
    });

    render(<DefaultContestProblemsPage contestId={contestId} />);

    const problems = screen.getAllByTestId("problem-row");
    expect(within(problems[0]).getByTestId("problem-title")).toHaveTextContent(
      "1. Problem One",
    );
    expect(within(problems[1]).getByTestId("problem-title")).toHaveTextContent(
      "2. Problem Two",
    );

    problems[0].click();
    expect(mockDownload).toHaveBeenCalledWith({ key: "desc1" });
    problems[1].click();
    expect(mockDownload).toHaveBeenCalledWith({ key: "desc2" });
  });

  it("does not render any rows if problems data is empty", () => {
    mockUseFindAllProblemsAction.mockReturnValue({
      data: [],
      isLoading: false,
      act: jest.fn(),
    });

    render(<DefaultContestProblemsPage contestId={contestId} />);
    expect(screen.queryAllByTestId("table-row")).toHaveLength(0);
  });
});
