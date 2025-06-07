import { render, screen } from "@testing-library/react";
import React from "react";
import ContestLayout from "@/app/contests/[id]/layout";
import { usePathname, useRouter } from "next/navigation";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { useFindContestMetadataByIdAction } from "@/app/_action/find-contest-metadata-action";
import { useSubscribeForMemberSubmissionAction } from "@/app/_action/subscribe-for-member-submission-action";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { toLocaleString } from "@/app/_util/date-utils";
import { ContestSummaryOutputDTO } from "@/core/service/dto/output/ContestSummaryOutputDTO";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/app/_util/authorization-hook", () => ({
  useAuthorization: jest.fn(),
}));

jest.mock("@/app/_action/find-contest-metadata-action", () => ({
  useFindContestSummaryByIdAction: jest.fn(),
}));

jest.mock("@/app/_action/subscribe-for-member-submission-action", () => ({
  useSubscribeForMemberSubmissionAction: jest.fn(),
}));

jest.mock("@/app/_component/navbar", () => ({
  Navbar: ({
    contest,
    signInPath,
  }: {
    contest: ContestSummaryOutputDTO;
    signInPath: string;
  }) => (
    <div data-testid="navbar">
      {contest.title} - {signInPath}
    </div>
  ),
}));

const mockUse = React.use as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseAuthorization = useAuthorization as jest.Mock;
const mockUseFindContestSummaryByIdAction =
  useFindContestMetadataByIdAction as jest.Mock;
const mockUseSubscribeForMemberSubmissionAction =
  useSubscribeForMemberSubmissionAction as jest.Mock;

describe("ContestLayout", () => {
  const contestId = 123;
  const children = <div data-testid="children-content">Children Content</div>;
  const getParams = Promise.resolve({ id: contestId });

  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUse.mockReturnValue({ id: contestId });
    mockUsePathname.mockReturnValue(`/contests/${contestId}/leaderboard`);
    mockUseRouter.mockReturnValue(mockRouter);

    mockUseAuthorization.mockReturnValue(null);
    mockUseFindContestSummaryByIdAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: jest.fn(),
    });
    mockUseSubscribeForMemberSubmissionAction.mockReturnValue({
      act: jest.fn(),
    });
  });

  it("renders spinner when contest data is loading", () => {
    render(<ContestLayout params={getParams}>{children}</ContestLayout>);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders not started message when contest status is NOT_STARTED", () => {
    const mockContest = {
      id: contestId,
      title: "Test Contest",
      status: ContestStatus.NOT_STARTED,
      startAt: "2025-06-01T10:00:00Z",
    };
    mockUseFindContestSummaryByIdAction.mockReturnValue({
      data: mockContest,
      isLoading: false,
      act: jest.fn(),
    });

    render(<ContestLayout params={getParams}>{children}</ContestLayout>);

    expect(screen.getByTestId("not-started:title")).toHaveTextContent(
      mockContest.title,
    );
    expect(screen.getByTestId("not-started:start-at")).toHaveTextContent(
      toLocaleString(mockContest.startAt),
    );
  });

  it("renders contest layout with navigation and children for active contest (non-contestant)", () => {
    const mockContest = {
      id: contestId,
      title: "Active Contest",
      status: ContestStatus.IN_PROGRESS,
      startAt: "2025-05-01T10:00:00Z",
    };
    mockUseFindContestSummaryByIdAction.mockReturnValue({
      data: mockContest,
      isLoading: false,
      act: jest.fn(),
    });
    mockUseAuthorization.mockReturnValue({
      member: { type: MemberType.ROOT },
    });

    render(<ContestLayout params={getParams}>{children}</ContestLayout>);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("children-content")).toBeInTheDocument();
    expect(screen.getByTestId("link:leaderboard")).toBeInTheDocument();
    expect(screen.getByTestId("link:problems")).toBeInTheDocument();
    expect(screen.queryByTestId("link:submissions")).not.toBeInTheDocument();
    expect(screen.getByTestId("link:timeline")).toBeInTheDocument();
  });

  it("renders contest layout with navigation and children for active contest (contestant)", () => {
    const mockContest = {
      id: contestId,
      title: "Active Contest",
      status: ContestStatus.IN_PROGRESS,
      startAt: "2025-05-01T10:00:00Z",
    };
    mockUseFindContestSummaryByIdAction.mockReturnValue({
      data: mockContest,
      isLoading: false,
      act: jest.fn(),
    });
    mockUseAuthorization.mockReturnValue({
      member: { id: 1, type: MemberType.CONTESTANT },
    });

    render(<ContestLayout params={getParams}>{children}</ContestLayout>);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("children-content")).toBeInTheDocument();
    expect(screen.getByTestId("link:leaderboard")).toBeInTheDocument();
    expect(screen.getByTestId("link:problems")).toBeInTheDocument();
    expect(screen.getByTestId("link:submissions")).toBeInTheDocument();
    expect(screen.getByTestId("link:timeline")).toBeInTheDocument();
  });

  it("calls findContestAction.act on initial render", () => {
    const mockAct = jest.fn();
    mockUseFindContestSummaryByIdAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: mockAct,
    });
    render(<ContestLayout params={getParams}>{children}</ContestLayout>);
    expect(mockAct).toHaveBeenCalledWith(contestId);
  });

  it("calls subscribeForMemberSubmissionAction.act if authorized as contestant", () => {
    const mockSubscribeAct = jest.fn();
    mockUseFindContestSummaryByIdAction.mockReturnValue({
      data: {
        id: contestId,
        title: "Active Contest",
        status: ContestStatus.IN_PROGRESS,
        startAt: "2025-05-01T10:00:00Z",
      },
      isLoading: false,
      act: jest.fn(),
    });
    mockUseAuthorization.mockReturnValue({
      member: { id: 1, type: MemberType.CONTESTANT },
    });
    mockUseSubscribeForMemberSubmissionAction.mockReturnValue({
      act: mockSubscribeAct,
    });

    render(<ContestLayout params={getParams}>{children}</ContestLayout>);
    expect(mockSubscribeAct).toHaveBeenCalledWith(1);
  });

  it("does not call subscribeForMemberSubmissionAction.act if not authorized or not contestant", () => {
    const mockSubscribeAct = jest.fn();
    mockUseFindContestSummaryByIdAction.mockReturnValue({
      data: {
        id: contestId,
        title: "Active Contest",
        status: ContestStatus.IN_PROGRESS,
        startAt: "2025-05-01T10:00:00Z",
      },
      isLoading: false,
      act: jest.fn(),
    });
    mockUseAuthorization.mockReturnValue(null);
    mockUseSubscribeForMemberSubmissionAction.mockReturnValue({
      act: mockSubscribeAct,
    });

    render(<ContestLayout params={getParams}>{children}</ContestLayout>);
    expect(mockSubscribeAct).not.toHaveBeenCalled();
  });

  it("calls router.push when a navigation tab is clicked", async () => {
    const mockContest = {
      id: contestId,
      title: "Active Contest",
      status: ContestStatus.IN_PROGRESS,
      startAt: "2025-05-01T10:00:00Z",
    };
    mockUseFindContestSummaryByIdAction.mockReturnValue({
      data: mockContest,
      isLoading: false,
      act: jest.fn(),
    });
    mockUseAuthorization.mockReturnValue({
      member: { type: MemberType.ROOT },
    });

    render(<ContestLayout params={getParams}>{children}</ContestLayout>);

    const problemsTab = screen.getByTestId("link:problems");
    problemsTab.click();

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/contests/${contestId}/problems`,
    );
  });
});
