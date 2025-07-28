import { render, screen } from "@testing-library/react";
import { mockRedirect, mockUseAuthorization } from "@/test/jest.setup";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import JuryLayout from "@/app/contests/[slug]/jury/layout";

jest.mock("@/app/contests/[slug]/_context/contest-metadata-context", () => ({
  useContestMetadata: jest.fn(() => ({
    slug: "test-contest",
  })),
}));
jest.mock("@/app/contests/[slug]/_component/contest-dashboard-layout", () => ({
  ContestDashboardLayout: jest.fn(({ children }: any) => <div>{children}</div>),
}));
jest.mock("@/app/contests/[slug]/jury/_context/jury-context", () => ({
  JuryContextProvider: ({ children }: any) => <div>{children}</div>,
}));

describe("JuryLayout", () => {
  it("should redirect to sign-in if not authenticated", () => {
    mockUseAuthorization.mockReturnValueOnce(undefined);

    render(
      <JuryLayout>
        <span data-testid="child" />
      </JuryLayout>,
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_SIGN_IN("test-contest"),
    );
  });

  it("should redirect to forbidden if not a jury", () => {
    mockUseAuthorization.mockReturnValueOnce({
      member: { type: MemberType.CONTESTANT },
    });

    render(
      <JuryLayout>
        <span data-testid="child" />
      </JuryLayout>,
    );

    expect(mockRedirect).toHaveBeenCalledWith(routes.FORBIDDEN);
  });

  it("should render ContestDashboardLayout with contestant context", () => {
    mockUseAuthorization.mockReturnValueOnce({
      member: { type: MemberType.JURY },
    });

    render(
      <JuryLayout>
        <span data-testid="child" />
      </JuryLayout>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(ContestDashboardLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        tabs: [
          {
            label: "tab-leaderboard",
            path: routes.CONTEST_JURY_LEADERBOARD("test-contest"),
          },
          {
            label: "tab-problems",
            path: routes.CONTEST_JURY_PROBLEMS("test-contest"),
          },
          {
            label: "tab-submissions",
            path: routes.CONTEST_JURY_SUBMISSIONS("test-contest"),
          },
          {
            label: "tab-clarifications",
            path: routes.CONTEST_JURY_CLARIFICATIONS("test-contest"),
          },
          {
            label: "tab-announcements",
            path: routes.CONTEST_JURY_ANNOUNCEMENTS("test-contest"),
          },
        ],
      }),
      undefined,
    );
  });
});
