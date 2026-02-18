import { useContestStatusWatcher } from "@/app/_lib/hook/contest-status-watcher-hook";
import { DashboardProvider } from "@/app/_lib/provider/dashboard-provider";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MockMemberPublicResponseDTO } from "@/test/mock/response/member/MockMemberPublicResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/provider/admin-dashboard-provider", () => ({
  AdminDashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-dashboard-provider">{children}</div>
  ),
}));

jest.mock("@/app/_lib/provider/contestant-dashboard-provider", () => ({
  ContestantDashboardProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="contestant-dashboard-provider">{children}</div>,
}));

jest.mock("@/app/_lib/provider/guest-dashboard-provider", () => ({
  GuestDashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="guest-dashboard-provider">{children}</div>
  ),
}));

jest.mock("@/app/_lib/provider/judge-dashboard-provider", () => ({
  JudgeDashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="judge-dashboard-provider">{children}</div>
  ),
}));

jest.mock("@/app/_lib/provider/staff-dashboard-provider", () => ({
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
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberPublicResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.ROOT,
            }),
          }),
        },
      );

      expect(getByTestId("admin-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("when user is ADMIN", () => {
    it("should render AdminDashboardProvider", async () => {
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberPublicResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.ADMIN,
            }),
          }),
        },
      );

      expect(getByTestId("admin-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("when user is STAFF", () => {
    it("should render StaffDashboardProvider", async () => {
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberPublicResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.STAFF,
            }),
          }),
        },
      );

      expect(getByTestId("staff-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("when user is JUDGE", () => {
    it("should render JudgeDashboardProvider", async () => {
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberPublicResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.JUDGE,
            }),
          }),
        },
      );

      expect(getByTestId("judge-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("when user is CONTESTANT", () => {
    it("should render WaitPage when contest has not started", async () => {
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.NOT_STARTED);

      const { getByTestId, queryByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberPublicResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.CONTESTANT,
            }),
          }),
        },
      );

      expect(getByTestId("wait-page")).toBeInTheDocument();
      expect(queryByTestId("test-content")).not.toBeInTheDocument();
    });

    it("should render ContestantDashboardProvider when contest is in progress", async () => {
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberPublicResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.CONTESTANT,
            }),
          }),
        },
      );

      expect(getByTestId("contestant-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });

    it("should render ContestantDashboardProvider when contest has ended", async () => {
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.ENDED);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: MockSession({
            member: MockMemberPublicResponseDTO({
              id: "test-id",
              name: "Test User",
              type: MemberType.CONTESTANT,
            }),
          }),
        },
      );

      expect(getByTestId("contestant-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("when user is not authenticated (guest)", () => {
    it("should render WaitPage when contest has not started", async () => {
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.NOT_STARTED);

      const { getByTestId, queryByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: null,
        },
      );

      expect(getByTestId("wait-page")).toBeInTheDocument();
      expect(queryByTestId("test-content")).not.toBeInTheDocument();
    });

    it("should render GuestDashboardProvider when contest is in progress", async () => {
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.IN_PROGRESS);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: null,
        },
      );

      expect(getByTestId("guest-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });

    it("should render GuestDashboardProvider when contest has ended", async () => {
      mockUseContestStatusWatcher.mockReturnValue(ContestStatus.ENDED);

      const { getByTestId } = await renderWithProviders(
        <DashboardProvider>
          <TestComponent />
        </DashboardProvider>,
        {
          session: null,
        },
      );

      expect(getByTestId("guest-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });
});
