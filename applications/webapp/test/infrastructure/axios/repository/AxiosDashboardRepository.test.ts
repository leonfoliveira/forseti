import { AxiosDashboardRepository } from "@/infrastructure/axios/repository/AxiosDashboardRepository";
import {
  MockAdminDashboardResponseDTO,
  MockContestantDashboardResponseDTO,
  MockGuestDashboardResponseDTO,
  MockJudgeDashboardResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("AxiosDashboardRepository", () => {
  it.each([
    ["admin", "getAdminDashboard", MockAdminDashboardResponseDTO()],
    ["contestant", "getContestantDashboard", MockContestantDashboardResponseDTO()],
    ["guest", "getGuestDashboard", MockGuestDashboardResponseDTO()],
    ["judge", "getJudgeDashboard", MockJudgeDashboardResponseDTO()],
  ] as const)("gets the %s dashboard", async (role, method, dashboard) => {
    const client = { get: jest.fn().mockResolvedValue({ data: dashboard }) };
    const repository = new AxiosDashboardRepository(client as never);

    await expect(repository[method]("contest-42")).resolves.toBe(dashboard);
    expect(client.get).toHaveBeenCalledWith(
      `/v1/contests/contest-42/dashboard/${role}`,
    );
  });
});
