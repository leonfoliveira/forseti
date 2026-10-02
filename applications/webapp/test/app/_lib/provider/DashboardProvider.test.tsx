import { screen } from "@testing-library/react";

import { DashboardProvider } from "@/app/_lib/provider/DashboardProvider";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MemberType } from "@/domain/enumerate/MemberType";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockContestResponseDTO, MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/_lib/hook/useContestStatusWatcher", () => ({
  useContestStatusWatcher: jest.fn(),
}));
jest.mock("@/app/[slug]/(dashboard)/_common/WaitPage", () => ({
  WaitPage: () => <div data-testid="wait-page">Waiting</div>,
}));
jest.mock("@/app/_lib/provider/dashboard/AdminDashboardProvider", () => ({
  AdminDashboardProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-provider">{children}</div>,
}));
jest.mock("@/app/_lib/provider/dashboard/JudgeDashboardProvider", () => ({
  JudgeDashboardProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="judge-provider">{children}</div>,
}));
jest.mock("@/app/_lib/provider/dashboard/ContestantDashboardProvider", () => ({
  ContestantDashboardProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="contestant-provider">{children}</div>,
}));
jest.mock("@/app/_lib/provider/dashboard/GuestDashboardProvider", () => ({
  GuestDashboardProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="guest-provider">{children}</div>,
}));

import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";

const status = jest.mocked(useContestStatusWatcher);

describe("DashboardProvider", () => {
  it.each([
    [MemberType.ROOT, "admin-provider"],
    [MemberType.ADMIN, "admin-provider"],
    [MemberType.JUDGE, "judge-provider"],
    [MemberType.CONTESTANT, "contestant-provider"],
  ])("selects the provider for member type %s", async (type, testId) => {
    status.mockReturnValue(ContestStatus.IN_PROGRESS);
    await renderWithProviders(<DashboardProvider><span>Body</span></DashboardProvider>, {
      contest: MockContestResponseDTO(),
      session: MockSessionResponseDTO({ member: { id: "member-1", name: "Ada", type } }),
    });
    expect(screen.getByTestId(testId)).toHaveTextContent("Body");
  });

  it.each([
    [MockSessionResponseDTO(), "wait-page"],
    [null, "wait-page"],
  ])("waits for an upcoming contest", async (session, testId) => {
    status.mockReturnValue(ContestStatus.NOT_STARTED);
    await renderWithProviders(<DashboardProvider><span>Body</span></DashboardProvider>, {
      contest: MockContestResponseDTO(),
      session,
    });
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it("selects guest dashboard after a contest has started", async () => {
    status.mockReturnValue(ContestStatus.ENDED);
    await renderWithProviders(<DashboardProvider><span>Body</span></DashboardProvider>, {
      contest: MockContestResponseDTO(),
      session: null,
    });
    expect(screen.getByTestId("guest-provider")).toHaveTextContent("Body");
  });
});
