import { render, screen, within } from "@testing-library/react";
import React from "react";
import { useFindAllProblemsForMemberAction } from "@/app/_action/find-all-problems-for-member-action";
import { attachmentService } from "@/app/_composition";
import { ContestantContestProblemsPage } from "@/app/contests/[id]/problems/_contestant-page";

jest.mock("@/app/_action/find-all-problems-for-member-action", () => ({
  useFindAllProblemsForMemberAction: jest.fn(),
}));

jest.mock("@/app/_composition", () => ({
  attachmentService: {
    download: jest.fn(),
  },
}));

const mockUseFindAllProblemsForMemberAction =
  useFindAllProblemsForMemberAction as jest.Mock;
const mockDownload = attachmentService.download as jest.Mock;

describe("ContestantContestProblemsPage", () => {
  const contestId = 123;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFindAllProblemsForMemberAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: jest.fn(),
    });
  });

  it("renders a spinner when problems data is loading (non-contestant)", () => {
    render(<ContestantContestProblemsPage contestId={contestId} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders a spinner when problems data is loading (contestant)", () => {
    render(<ContestantContestProblemsPage contestId={contestId} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("calls findAllProblemsForMemberAction.act on mount", () => {
    const mockAct = jest.fn();
    mockUseFindAllProblemsForMemberAction.mockReturnValue({
      data: [],
      isLoading: false,
      act: mockAct,
    });

    render(<ContestantContestProblemsPage contestId={contestId} />);
    expect(mockAct).toHaveBeenCalledWith(contestId);
  });

  it("renders member problems list with status badges", () => {
    const mockMemberProblems = [
      {
        id: 1,
        title: "Problem One",
        description: { key: "desc1" },
        isAccepted: true,
        wrongSubmissions: 0,
      },
      {
        id: 2,
        title: "Problem Two",
        description: { key: "desc2" },
        isAccepted: false,
        wrongSubmissions: 3,
      },
    ];
    mockUseFindAllProblemsForMemberAction.mockReturnValue({
      data: mockMemberProblems,
      isLoading: false,
      act: jest.fn(),
    });

    render(<ContestantContestProblemsPage contestId={contestId} />);

    const problems = screen.getAllByTestId("member-problem-row");
    expect(within(problems[0]).getByTestId("problem-title")).toHaveTextContent(
      "1. Problem One",
    );
    expect(within(problems[0]).getByTestId("badge:ac")).toBeInTheDocument();
    expect(within(problems[1]).getByTestId("problem-title")).toHaveTextContent(
      "2. Problem Two",
    );

    problems[0].click();
    expect(mockDownload).toHaveBeenCalledWith({ key: "desc1" });
    problems[1].click();
    expect(mockDownload).toHaveBeenCalledWith({ key: "desc2" });
  });

  it("does not render any rows if problems data is empty", () => {
    mockUseFindAllProblemsForMemberAction.mockReturnValue({
      data: [],
      isLoading: false,
      act: jest.fn(),
    });

    render(<ContestantContestProblemsPage contestId={contestId} />);
    expect(screen.queryAllByTestId("table-row")).toHaveLength(0);
  });
});
