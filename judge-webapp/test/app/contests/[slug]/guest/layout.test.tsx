import { render, screen } from "@testing-library/react";

import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import GuestLayout from "@/app/contests/[slug]/guest/layout";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import {
  mockUseAuthorization,
  mockUseContestMetadata,
} from "@/test/jest.setup";

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
    mockUseContestMetadata.mockReturnValue({
      slug: "test-contest",
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
            label: {
              id: "app.contests.[slug].guest.layout.tab-leaderboard",
              defaultMessage: "Leaderboard",
            },
            path: routes.CONTEST_GUEST_LEADERBOARD("test-contest"),
          },
          {
            label: {
              id: "app.contests.[slug].guest.layout.tab-problems",
              defaultMessage: "Problems",
            },
            path: routes.CONTEST_GUEST_PROBLEMS("test-contest"),
          },
          {
            label: {
              id: "app.contests.[slug].guest.layout.tab-timeline",
              defaultMessage: "Timeline",
            },
            path: routes.CONTEST_GUEST_TIMELINE("test-contest"),
          },
          {
            label: {
              id: "app.contests.[slug].guest.layout.tab-clarifications",
              defaultMessage: "Clarifications",
            },
            path: routes.CONTEST_GUEST_CLARIFICATIONS("test-contest"),
          },
          {
            label: {
              id: "app.contests.[slug].guest.layout.tab-announcements",
              defaultMessage: "Announcements",
            },
            path: routes.CONTEST_GUEST_ANNOUNCEMENTS("test-contest"),
          },
        ],
      }),
      undefined,
    );
  });
});
