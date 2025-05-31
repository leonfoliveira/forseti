import { render, screen, within } from "@testing-library/react";
import React from "react";
import { useGetLeaderboardAction } from "@/app/_action/get-leaderboard-action";
import ContestLeaderboardPage from "@/app/contests/[id]/leaderboard/page";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(),
  useEffect: jest.fn(),
}));

jest.mock("@/app/_action/get-leaderboard-action", () => ({
  useGetLeaderboardAction: jest.fn(),
}));

const mockUse = React.use as jest.Mock;
const mockUseEffect = React.useEffect as jest.Mock;
const mockUseGetLeaderboardAction = useGetLeaderboardAction as jest.Mock;

describe("ContestLeaderboardPage", () => {
  const contestId = 123;
  const getParams = Promise.resolve({ id: contestId });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUse.mockReturnValue({ id: contestId });
    mockUseEffect.mockImplementation((callback) => callback());
  });

  it("renders a spinner when leaderboard data is loading", () => {
    mockUseGetLeaderboardAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: jest.fn(),
    });

    render(<ContestLeaderboardPage params={getParams} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders leaderboard table with problems and members", () => {
    const mockLeaderboard = {
      problems: [
        { id: 101, title: "Problem A" },
        { id: 102, title: "Problem B" },
      ],
      members: [
        {
          id: 201,
          name: "Alice",
          penalty: 100,
          problems: [
            { id: 101, isAccepted: true, wrongSubmissions: 0 },
            { id: 102, isAccepted: false, wrongSubmissions: 2 },
          ],
        },
        {
          id: 202,
          name: "Bob",
          penalty: 50,
          problems: [
            { id: 101, isAccepted: true, wrongSubmissions: 1 },
            { id: 102, isAccepted: true, wrongSubmissions: 0 },
          ],
        },
      ],
    };

    mockUseGetLeaderboardAction.mockReturnValue({
      data: mockLeaderboard,
      isLoading: false,
      act: jest.fn(),
    });

    render(<ContestLeaderboardPage params={getParams} />);

    const problems = screen.getAllByTestId("problem-title");
    expect(problems.length).toBe(2);
    expect(problems[0]).toHaveTextContent("1. Problem A");
    expect(problems[1]).toHaveTextContent("2. Problem B");

    const members = screen.getAllByTestId("member");
    expect(members.length).toBe(2);

    expect(within(members[0]).getByTestId("member-name")).toHaveTextContent(
      "1. Alice",
    );
    const memberProblems = within(members[0]).getAllByTestId("member-problem");
    expect(
      within(memberProblems[0]).getByTestId("badge:ac"),
    ).toBeInTheDocument();
    expect(
      within(memberProblems[1]).getByTestId("badge:wa"),
    ).toBeInTheDocument();
    expect(within(members[0]).getByTestId("member-penalty")).toHaveTextContent(
      "100",
    );

    expect(within(members[1]).getByTestId("member-name")).toHaveTextContent(
      "2. Bob",
    );
    const memberProblems1 = within(members[1]).getAllByTestId("member-problem");
    expect(
      within(memberProblems1[0]).getByTestId("badge:ac"),
    ).toBeInTheDocument();
    expect(
      within(memberProblems1[1]).getByTestId("badge:ac"),
    ).toBeInTheDocument();
    expect(within(members[1]).getByTestId("member-penalty")).toHaveTextContent(
      "50",
    );
  });

  it("calls getLeaderboardAction.act with the correct ID on mount", () => {
    const mockAct = jest.fn();
    mockUseGetLeaderboardAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: mockAct,
    });

    render(<ContestLeaderboardPage params={getParams} />);
    expect(mockAct).toHaveBeenCalledWith(contestId);
  });

  it("renders empty penalty string if penalty is 0 or null", () => {
    const mockLeaderboard = {
      problems: [{ id: 101, title: "Problem A" }],
      members: [
        {
          id: 201,
          name: "Alice",
          penalty: 0,
          problems: [{ id: 101, isAccepted: true, wrongSubmissions: 0 }],
        },
      ],
    };

    mockUseGetLeaderboardAction.mockReturnValue({
      data: mockLeaderboard,
      isLoading: false,
      act: jest.fn(),
    });

    render(<ContestLeaderboardPage params={getParams} />);

    expect(screen.getByTestId("member-penalty")).toHaveTextContent("");
  });
});
