import { render, screen } from "@testing-library/react";
import { mockUseAuthorization } from "@/test/jest.setup";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import GuestLayout from "@/app/contests/[slug]/guest/layout";

jest.mock("@/app/contests/[slug]/_context/contest-metadata-context", () => ({
  useContestMetadata: jest.fn(() => ({
    slug: "test-contest",
  })),
}));
jest.mock("@/app/contests/[slug]/_component/contest-dashboard-layout", () => ({
  ContestDashboardLayout: jest.fn(({ children }: any) => <div>{children}</div>),
}));
jest.mock("@/app/contests/[slug]/guest/_context/guest-context", () => ({
  GuestContextProvider: ({ children }: any) => <div>{children}</div>,
}));

describe("GuestLayout", () => {
  it("should render ContestDashboardLayout with contestant context", () => {
    mockUseAuthorization.mockReturnValueOnce({
      member: { type: MemberType.CONTESTANT },
    });

    render(
      <GuestLayout>
        <span data-testid="child" />
      </GuestLayout>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(ContestDashboardLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        tabs: [
          {
            label: "leaderboard",
            path: routes.CONTEST_GUEST_LEADERBOARD("test-contest"),
          },
          {
            label: "problems",
            path: routes.CONTEST_GUEST_PROBLEMS("test-contest"),
          },
          {
            label: "timeline",
            path: routes.CONTEST_GUEST_TIMELINE("test-contest"),
          },
          {
            label: "clarifications",
            path: routes.CONTEST_GUEST_CLARIFICATIONS("test-contest"),
          },
          {
            label: "announcements",
            path: routes.CONTEST_GUEST_ANNOUNCEMENTS("test-contest"),
          },
        ],
      }),
      undefined,
    );
  });
});
