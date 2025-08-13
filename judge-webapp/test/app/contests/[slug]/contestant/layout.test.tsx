import { render, screen } from "@testing-library/react";

import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import ContestantLayout from "@/app/contests/[slug]/contestant/layout";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { mockRedirect, mockUseAuthorization } from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_component/contest-dashboard-layout", () => ({
  ContestDashboardLayout: jest.fn(({ children }: any) => <div>{children}</div>),
}));

describe("ContestantLayout", () => {
  it("should redirect to sign-in if not authenticated", () => {
    mockUseAuthorization.mockReturnValueOnce(undefined);

    render(
      <ContestantLayout>
        <span data-testid="child" />
      </ContestantLayout>,
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_SIGN_IN("contest"),
    );
  });

  it("should redirect to forbidden if not a contestant", () => {
    mockUseAuthorization.mockReturnValueOnce({
      member: { type: MemberType.JUDGE },
    });

    render(
      <ContestantLayout>
        <span data-testid="child" />
      </ContestantLayout>,
    );

    expect(mockRedirect).toHaveBeenCalledWith(routes.FORBIDDEN);
  });

  it("should render ContestDashboardLayout with contestant context", () => {
    mockUseAuthorization.mockReturnValueOnce({
      member: { type: MemberType.CONTESTANT },
    });

    render(
      <ContestantLayout>
        <span data-testid="child" />
      </ContestantLayout>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(ContestDashboardLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        contestMetadata: { id: "contest", slug: "contest" },
        tabs: [
          {
            label: {
              id: "app.contests.[slug].contestant.layout.tab-leaderboard",
              defaultMessage: "Leaderboard",
            },
            path: routes.CONTEST_CONTESTANT_LEADERBOARD("contest"),
          },
          {
            label: {
              id: "app.contests.[slug].contestant.layout.tab-problems",
              defaultMessage: "Problems",
            },
            path: routes.CONTEST_CONTESTANT_PROBLEMS("contest"),
          },
          {
            label: {
              id: "app.contests.[slug].contestant.layout.tab-timeline",
              defaultMessage: "Timeline",
            },
            path: routes.CONTEST_CONTESTANT_TIMELINE("contest"),
          },
          {
            label: {
              id: "app.contests.[slug].contestant.layout.tab-submissions",
              defaultMessage: "Submissions",
            },
            path: routes.CONTEST_CONTESTANT_SUBMISSIONS("contest"),
          },
          {
            label: {
              id: "app.contests.[slug].contestant.layout.tab-clarifications",
              defaultMessage: "Clarifications",
            },
            path: routes.CONTEST_CONTESTANT_CLARIFICATIONS("contest"),
          },
          {
            label: {
              id: "app.contests.[slug].contestant.layout.tab-announcements",
              defaultMessage: "Announcements",
            },
            path: routes.CONTEST_CONTESTANT_ANNOUNCEMENTS("contest"),
          },
        ],
      }),
      undefined,
    );
  });
});
