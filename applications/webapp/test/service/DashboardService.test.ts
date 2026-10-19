import { DashboardService } from "@/service/DashboardService";
import {
  MockAdminDashboardResponseDTO,
  MockContestantDashboardResponseDTO,
  MockSpectatorDashboardResponseDTO,
  MockJudgeDashboardResponseDTO,
  MockStaffDashboardResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("DashboardService", () => {
  it("delegates each dashboard request to the matching repository method", async () => {
    const expected = {
      admin: MockAdminDashboardResponseDTO(),
      judge: MockJudgeDashboardResponseDTO(),
      staff: MockStaffDashboardResponseDTO(),
      contestant: MockContestantDashboardResponseDTO(),
      spectator: MockSpectatorDashboardResponseDTO(),
    };
    const repository = {
      getAdminDashboard: jest.fn().mockResolvedValue(expected.admin),
      getContestantDashboard: jest.fn().mockResolvedValue(expected.contestant),
      getSpectatorDashboard: jest.fn().mockResolvedValue(expected.spectator),
      getJudgeDashboard: jest.fn().mockResolvedValue(expected.judge),
      getStaffDashboard: jest.fn().mockResolvedValue(expected.staff),
    };
    const service = new DashboardService(repository);

    await expect(service.getAdminDashboard("contest-42")).resolves.toBe(
      expected.admin,
    );
    await expect(service.getContestantDashboard("contest-42")).resolves.toBe(
      expected.contestant,
    );
    await expect(service.getSpectatorDashboard("contest-42")).resolves.toBe(
      expected.spectator,
    );
    await expect(service.getJudgeDashboard("contest-42")).resolves.toBe(
      expected.judge,
    );
    await expect(service.getStaffDashboard("contest-42")).resolves.toBe(
      expected.staff,
    );
    Object.values(repository).forEach((method) =>
      expect(method).toHaveBeenCalledWith("contest-42"),
    );
  });
});
