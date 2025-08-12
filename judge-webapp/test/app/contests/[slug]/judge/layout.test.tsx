import { render, screen } from "@testing-library/react";

import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import JudgeLayout from "@/app/contests/[slug]/judge/layout";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import {
  mockRedirect,
  mockUseAuthorization,
  mockUseContestMetadata,
} from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_component/contest-dashboard-layout", () => ({
  ContestDashboardLayout: jest.fn(({ children }: any) => <div>{children}</div>),
}));
jest.mock("@/app/contests/[slug]/judge/_context/judge-context", () => ({
  JudgeContextProvider: ({ children }: any) => <div>{children}</div>,
}));

describe("JudgeLayout", () => {
  beforeEach(() => {
    mockUseContestMetadata.mockReturnValue({
      slug: "test-contest",
    });
  });

  it("should redirect to sign-in if not authenticated", () => {
    mockUseAuthorization.mockReturnValueOnce(undefined);

    render(
      <JudgeLayout>
        <span data-testid="child" />
      </JudgeLayout>,
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_SIGN_IN("test-contest"),
    );
  });

  it("should redirect to forbidden if not a judge", () => {
    mockUseAuthorization.mockReturnValueOnce({
      member: { type: MemberType.CONTESTANT },
    });

    render(
      <JudgeLayout>
        <span data-testid="child" />
      </JudgeLayout>,
    );

    expect(mockRedirect).toHaveBeenCalledWith(routes.FORBIDDEN);
  });

  it("should render ContestDashboardLayout with contestant context", () => {
    mockUseAuthorization.mockReturnValueOnce({
      member: { type: MemberType.JUDGE },
    });

    render(
      <JudgeLayout>
        <span data-testid="child" />
      </JudgeLayout>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(ContestDashboardLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        tabs: [
          {
            label: {
              id: "app.contests.[slug].judge.layout.tab-leaderboard",
              defaultMessage: "Leaderboard",
            },
            path: routes.CONTEST_JUDGE_LEADERBOARD("test-contest"),
          },
          {
            label: {
              id: "app.contests.[slug].judge.layout.tab-problems",
              defaultMessage: "Problems",
            },
            path: routes.CONTEST_JUDGE_PROBLEMS("test-contest"),
          },
          {
            label: {
              id: "app.contests.[slug].judge.layout.tab-submissions",
              defaultMessage: "Submissions",
            },
            path: routes.CONTEST_JUDGE_SUBMISSIONS("test-contest"),
          },
          {
            label: {
              id: "app.contests.[slug].judge.layout.tab-clarifications",
              defaultMessage: "Clarifications",
            },
            path: routes.CONTEST_JUDGE_CLARIFICATIONS("test-contest"),
          },
          {
            label: {
              id: "app.contests.[slug].judge.layout.tab-announcements",
              defaultMessage: "Announcements",
            },
            path: routes.CONTEST_JUDGE_ANNOUNCEMENTS("test-contest"),
          },
        ],
      }),
      undefined,
    );
  });
});
