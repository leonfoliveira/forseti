import { render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { useFindAllProblemsAction } from "@/app/_action/find-all-problems-action";
import { useFindAllProblemsForMemberAction } from "@/app/_action/find-all-problems-for-member-action";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { attachmentService } from "@/app/_composition";
import ContestProblemsPage from "@/app/contests/[id]/problems/page"; // Import the real attachmentService

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(),
}));

jest.mock("@/app/_util/authorization-hook", () => ({
  useAuthorization: jest.fn(),
}));
jest.mock("@/app/_action/find-all-problems-action", () => ({
  useFindAllProblemsAction: jest.fn(),
}));
jest.mock("@/app/_action/find-all-problems-for-member-action", () => ({
  useFindAllProblemsForMemberAction: jest.fn(),
}));

jest.mock("@/app/_composition", () => ({
  attachmentService: {
    download: jest.fn(),
  },
}));

const mockUse = React.use as jest.Mock;
const mockUseAuthorization = useAuthorization as jest.Mock;
const mockUseFindAllProblemsAction = useFindAllProblemsAction as jest.Mock;
const mockUseFindAllProblemsForMemberAction =
  useFindAllProblemsForMemberAction as jest.Mock;
const mockDownload = attachmentService.download as jest.Mock;

describe("ContestProblemsPage", () => {
  const contestId = 123;
  const getParams = Promise.resolve({ id: contestId });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUse.mockReturnValue({ id: contestId });
    mockUseAuthorization.mockReturnValue(null);
    mockUseFindAllProblemsAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: jest.fn(),
    });
    mockUseFindAllProblemsForMemberAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: jest.fn(),
    });
  });

  it("renders a spinner when problems data is loading (non-contestant)", () => {
    render(<ContestProblemsPage params={getParams} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders a spinner when problems data is loading (contestant)", () => {
    mockUseAuthorization.mockReturnValue({
      member: { type: MemberType.CONTESTANT },
    });
    render(<ContestProblemsPage params={getParams} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("calls findAllProblemsAction.act on mount if not a contestant", () => {
    const mockAct = jest.fn();
    mockUseFindAllProblemsAction.mockReturnValue({
      data: [],
      isLoading: false,
      act: mockAct,
    });
    mockUseAuthorization.mockReturnValue({
      member: { type: MemberType.ROOT },
    });

    render(<ContestProblemsPage params={getParams} />);
    expect(mockAct).toHaveBeenCalledWith(contestId);
    expect(mockUseFindAllProblemsForMemberAction().act).not.toHaveBeenCalled();
  });

  it("calls findAllProblemsForMemberAction.act on mount if a contestant", () => {
    const mockAct = jest.fn();
    mockUseFindAllProblemsForMemberAction.mockReturnValue({
      data: [],
      isLoading: false,
      act: mockAct,
    });
    mockUseAuthorization.mockReturnValue({
      member: { type: MemberType.CONTESTANT },
    });

    render(<ContestProblemsPage params={getParams} />);
    expect(mockAct).toHaveBeenCalledWith(contestId);
    expect(mockUseFindAllProblemsAction().act).not.toHaveBeenCalled();
  });

  it("renders public problems list when not a contestant", async () => {
    const mockProblems = [
      { id: 1, title: "Problem One", description: "desc1" },
      { id: 2, title: "Problem Two", description: "desc2" },
    ];
    mockUseFindAllProblemsAction.mockReturnValue({
      data: mockProblems,
      isLoading: false,
      act: jest.fn(),
    });
    mockUseFindAllProblemsForMemberAction.mockReturnValue({
      data: [],
      isLoading: false,
      act: jest.fn(),
    });
    mockUseAuthorization.mockReturnValue({
      member: { type: MemberType.ROOT },
    });

    render(<ContestProblemsPage params={getParams} />);

    await waitFor(() => {
      expect(
        screen.queryByTestId("member-problem-row"),
      ).not.toBeInTheDocument();
      const problems = screen.getAllByTestId("problem-row");
      expect(
        within(problems[0]).getByTestId("problem-title"),
      ).toHaveTextContent("1. Problem One");
      expect(
        within(problems[1]).getByTestId("problem-title"),
      ).toHaveTextContent("2. Problem Two");
    });
  });

  it("renders member problems list with status badges when a contestant", () => {
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
    mockUseFindAllProblemsAction.mockReturnValue({
      data: [],
      isLoading: false,
      act: jest.fn(),
    });
    mockUseFindAllProblemsForMemberAction.mockReturnValue({
      data: mockMemberProblems,
      isLoading: false,
      act: jest.fn(),
    });
    mockUseAuthorization.mockReturnValue({
      member: { type: MemberType.CONTESTANT },
    });

    render(<ContestProblemsPage params={getParams} />);

    const problems = screen.getAllByTestId("member-problem-row");
    expect(within(problems[0]).getByTestId("problem-title")).toHaveTextContent(
      "1. Problem One",
    );
    expect(within(problems[0]).getByTestId("badge:ac")).toBeInTheDocument();
    expect(within(problems[1]).getByTestId("problem-title")).toHaveTextContent(
      "2. Problem Two",
    );
    expect(screen.queryByTestId("problem-row")).not.toBeInTheDocument();

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
    mockUseAuthorization.mockReturnValue({
      member: { type: MemberType.CONTESTANT },
    });

    render(<ContestProblemsPage params={getParams} />);
    expect(screen.queryAllByTestId("table-row")).toHaveLength(0);
  });
});
