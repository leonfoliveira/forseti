import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { DashboardProvider } from "@/lib/provider/dashboard-provider";
import { useContestStatusWatcher } from "@/lib/util/contest-status-watcher";
import { MockAuthorization } from "@/test/mock/model/MockAuthorization";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/lib/provider/admin-dashboard-provider", () => ({
  AdminDashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-dashboard-provider">{children}</div>
  ),
}));

jest.mock("@/lib/provider/contestant-dashboard-provider", () => ({
  ContestantDashboardProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="contestant-dashboard-provider">{children}</div>,
}));

jest.mock("@/lib/provider/guest-dashboard-provider", () => ({
  GuestDashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="guest-dashboard-provider">{children}</div>
  ),
}));

jest.mock("@/lib/provider/judge-dashboard-provider", () => ({
  JudgeDashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="judge-dashboard-provider">{children}</div>
  ),
}));

jest.mock("@/lib/util/contest-status-watcher");
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
          authorization: MockAuthorization({
            member: {
              id: "test-id",
              contestId: "contest-id",
              name: "Test User",
              type: MemberType.ROOT,
            },
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
          authorization: MockAuthorization({
            member: {
              id: "test-id",
              contestId: "contest-id",
              name: "Test User",
              type: MemberType.ADMIN,
            },
          }),
        },
      );

      expect(getByTestId("admin-dashboard-provider")).toBeInTheDocument();
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
          authorization: MockAuthorization({
            member: {
              id: "test-id",
              contestId: "contest-id",
              name: "Test User",
              type: MemberType.JUDGE,
            },
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
          authorization: MockAuthorization({
            member: {
              id: "test-id",
              contestId: "contest-id",
              name: "Test User",
              type: MemberType.CONTESTANT,
            },
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
          authorization: MockAuthorization({
            member: {
              id: "test-id",
              contestId: "contest-id",
              name: "Test User",
              type: MemberType.CONTESTANT,
            },
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
          authorization: MockAuthorization({
            member: {
              id: "test-id",
              contestId: "contest-id",
              name: "Test User",
              type: MemberType.CONTESTANT,
            },
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
          authorization: null,
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
          authorization: null,
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
          authorization: null,
        },
      );

      expect(getByTestId("guest-dashboard-provider")).toBeInTheDocument();
      expect(getByTestId("test-content")).toBeInTheDocument();
    });
  });
});
