import { useRouter } from "next/navigation";

import { useContestStatusWatcher } from "@/app/_lib/hook/contest-status-watcher-hook";
import { DashboardProvider } from "@/app/_lib/provider/dashboard-provider";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockMemberResponseDTO } from "@/test/mock/response/member/MockMemberResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/provider/dashboard/admin-dashboard-provider", () => ({
  AdminDashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-dashboard-provider">{children}</div>
  ),
}));

jest.mock(
  "@/app/_lib/provider/dashboard/contestant-dashboard-provider",
  () => ({
    ContestantDashboardProvider: ({
      children,
    }: {
      children: React.ReactNode;
    }) => <div data-testid="contestant-dashboard-provider">{children}</div>,
  }),
);

jest.mock("@/app/_lib/provider/dashboard/guest-dashboard-provider", () => ({
  GuestDashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="guest-dashboard-provider">{children}</div>
  ),
}));

jest.mock("@/app/_lib/provider/dashboard/judge-dashboard-provider", () => ({
  JudgeDashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="judge-dashboard-provider">{children}</div>
  ),
}));

jest.mock("@/app/_lib/provider/dashboard/staff-dashboard-provider", () => ({
  StaffDashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="staff-dashboard-provider">{children}</div>
  ),
}));

jest.mock("@/app/_lib/hook/contest-status-watcher-hook");
jest.mock("@/app/[slug]/(dashboard)/_common/wait-page", () => ({
  WaitPage: () => <div data-testid="wait-page">Wait Page</div>,
}));

describe("DashboardProvider", () => {
  const TestComponent = () => (
    <div data-testid="test-content">Test Content</div>
  );

  const mockUseContestStatusWatcher = useContestStatusWatcher as jest.Mock;

  describe("when user is ROOT", () => {
    it("should render AdminDashboardProvider", async () => {
      const contest = MockContestResponseDTO();
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.ROOT,
            }),
          }),
          contest,
        },
      );

      expect(getByTestId("admin-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("when user is ADMIN", () => {
    it("should render AdminDashboardProvider", async () => {
      const contest = MockContestResponseDTO();
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.ADMIN,
            }),
          }),
          contest,
        },
      );

      expect(getByTestId("admin-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("when user is STAFF", () => {
    it("should render StaffDashboardProvider", async () => {
      const contest = MockContestResponseDTO();
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.STAFF,
            }),
          }),
          contest,
        },
      );

      expect(getByTestId("staff-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("when user is JUDGE", () => {
    it("should render JudgeDashboardProvider", async () => {
      const contest = MockContestResponseDTO();
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.JUDGE,
            }),
          }),
          contest,
        },
      );

      expect(getByTestId("judge-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("when user is CONTESTANT", () => {
    it("should render WaitPage when contest has not started", async () => {
      const contest = MockContestResponseDTO();
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.NOT_STARTED);

      const { getByTestId, queryByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.CONTESTANT,
            }),
          }),
          contest,
        },
      );

      expect(getByTestId("wait-page")).toBeInTheDocument();
      expect(queryByTestId("test-content")).not.toBeInTheDocument();
    });

    it("should render ContestantDashboardProvider when contest is in progress", async () => {
      const contest = MockContestResponseDTO();
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.CONTESTANT,
            }),
          }),
          contest,
        },
      );

      expect(getByTestId("contestant-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });

    it("should render ContestantDashboardProvider when contest has ended", async () => {
      const contest = MockContestResponseDTO();
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.ENDED);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.CONTESTANT,
            }),
          }),
          contest,
        },
      );

      expect(getByTestId("contestant-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("when user is not authenticated (guest)", () => {
    it("should redirect to sign-in page when guest access is disabled", async () => {
      const contest = MockContestResponseDTO({
        settings: {
          isGuestEnabled: false,
        } as any,
      });

      await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: null,
          contest,
        },
      );

      expect(useRouter().replace).toHaveBeenCalledWith(
        routes.CONTEST_SIGN_IN("test-contest"),
      );
    });

    it("should render WaitPage when contest has not started", async () => {
      const contest = MockContestResponseDTO();
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.NOT_STARTED);

      const { getByTestId, queryByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: null,
          contest,
        },
      );

      expect(getByTestId("wait-page")).toBeInTheDocument();
      expect(queryByTestId("test-content")).not.toBeInTheDocument();
    });

    it("should render GuestDashboardProvider when contest is in progress", async () => {
      const contest = MockContestResponseDTO();
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: null,
          contest,
        },
      );

      expect(getByTestId("guest-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });

    it("should render GuestDashboardProvider when contest has ended", async () => {
      const contest = MockContestResponseDTO();
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.ENDED);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: null,
          contest,
        },
      );

      expect(getByTestId("guest-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });
});
