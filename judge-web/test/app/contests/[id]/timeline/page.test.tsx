import { render, renderHook, screen, within } from "@testing-library/react";
import React from "react";
import { useFindAllContestSubmissionsAction } from "@/app/_action/find-all-contest-submissions-action";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { toLocaleString } from "@/app/_util/date-utils";
import ContestTimelinePage from "@/app/contests/[id]/timeline/page";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(),
}));

jest.mock("@/app/_action/find-all-contest-submissions-action", () => ({
  useFindAllSubmissionsAction: jest.fn(),
}));

const mockUse = React.use as jest.Mock;
const mockUseFindAllSubmissionsAction =
  useFindAllContestSubmissionsAction as jest.Mock;

describe("ContestTimelinePage", () => {
  const contestId = 123;
  const getParams = Promise.resolve({ id: contestId });

  const mockSubmissions = [
    {
      id: 1,
      createdAt: "2025-05-30T10:00:00Z",
      member: { id: 101, name: "Alice" },
      problem: { id: 201, title: "Problem A" },
      language: Language.PYTHON_3_13_3,
      status: SubmissionStatus.ACCEPTED,
    },
    {
      id: 2,
      createdAt: "2025-05-30T10:05:00Z",
      member: { id: 102, name: "Bob" },
      problem: { id: 202, title: "Problem B" },
      language: Language.PYTHON_3_13_3,
      status: SubmissionStatus.WRONG_ANSWER,
    },
  ];

  const {
    result: {
      current: { formatLanguage },
    },
  } = renderHook(() => useContestFormatter());

  beforeEach(() => {
    jest.clearAllMocks();
    mockUse.mockReturnValue({ id: contestId });
    mockUseFindAllSubmissionsAction.mockReturnValue({
      data: mockSubmissions,
      isLoading: false,
      act: jest.fn(),
    });
  });

  it("renders a spinner when submissions data is loading", () => {
    mockUseFindAllSubmissionsAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: jest.fn(),
    });
    render(<ContestTimelinePage params={getParams} />);
    expect(screen.getByTestId("submission:spinner")).toBeInTheDocument();
  });

  it("renders 'No submission yet' message when no submissions are available and not loading", () => {
    mockUseFindAllSubmissionsAction.mockReturnValue({
      data: [],
      isLoading: false,
      act: jest.fn(),
    });
    render(<ContestTimelinePage params={getParams} />);
    expect(screen.getByTestId("submission:empty")).toBeInTheDocument();
  });

  it("renders submissions table with correct data", () => {
    render(<ContestTimelinePage params={getParams} />);

    expect(screen.getAllByTestId("table-header-cell")).toHaveLength(5);
    const rows = screen.getAllByTestId("submission:row");
    expect(rows).toHaveLength(mockSubmissions.length);

    expect(
      within(rows[0]).getByTestId("submission:created-at"),
    ).toHaveTextContent(toLocaleString(mockSubmissions[0].createdAt));
    expect(within(rows[0]).getByTestId("submission:member")).toHaveTextContent(
      mockSubmissions[0].member.name,
    );
    expect(within(rows[0]).getByTestId("submission:problem")).toHaveTextContent(
      mockSubmissions[0].problem.title,
    );
    expect(
      within(rows[0]).getByTestId("submission:language"),
    ).toHaveTextContent(formatLanguage(mockSubmissions[0].language));
    expect(
      within(within(rows[0]).getByTestId("submission:status")).getByTestId(
        "badge",
      ),
    ).toBeInTheDocument();

    expect(
      within(rows[1]).getByTestId("submission:created-at"),
    ).toHaveTextContent(toLocaleString(mockSubmissions[1].createdAt));
    expect(within(rows[1]).getByTestId("submission:member")).toHaveTextContent(
      mockSubmissions[1].member.name,
    );
    expect(within(rows[1]).getByTestId("submission:problem")).toHaveTextContent(
      mockSubmissions[1].problem.title,
    );
    expect(
      within(rows[1]).getByTestId("submission:language"),
    ).toHaveTextContent(formatLanguage(mockSubmissions[1].language));
    expect(
      within(within(rows[1]).getByTestId("submission:status")).getByTestId(
        "badge",
      ),
    ).toBeInTheDocument();
  });

  it("calls findAllSubmissionsAction.act with the correct ID on mount", () => {
    const mockAct = jest.fn();
    mockUseFindAllSubmissionsAction.mockReturnValue({
      data: [],
      isLoading: false,
      act: mockAct,
    });
    render(<ContestTimelinePage params={getParams} />);
    expect(mockAct).toHaveBeenCalledWith(contestId);
  });
});
