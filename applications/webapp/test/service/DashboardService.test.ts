import { DashboardService } from "@/service/DashboardService";
import {
  MockAdminDashboardResponseDTO,
  MockContestantDashboardResponseDTO,
  MockGuestDashboardResponseDTO,
  MockJudgeDashboardResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("DashboardService", () => {
  it("delegates each dashboard request to the matching repository method", async () => {
    const expected = {
      admin: MockAdminDashboardResponseDTO(),
      contestant: MockContestantDashboardResponseDTO(),
      guest: MockGuestDashboardResponseDTO(),
      judge: MockJudgeDashboardResponseDTO(),
    };
    const repository = {
      getAdminDashboard: jest.fn().mockResolvedValue(expected.admin),
      getContestantDashboard: jest.fn().mockResolvedValue(expected.contestant),
      getGuestDashboard: jest.fn().mockResolvedValue(expected.guest),
      getJudgeDashboard: jest.fn().mockResolvedValue(expected.judge),
    };
    const service = new DashboardService(repository);

    await expect(service.getAdminDashboard("contest-42")).resolves.toBe(
      expected.admin,
    );
    await expect(service.getContestantDashboard("contest-42")).resolves.toBe(
      expected.contestant,
    );
    await expect(service.getGuestDashboard("contest-42")).resolves.toBe(
      expected.guest,
    );
    await expect(service.getJudgeDashboard("contest-42")).resolves.toBe(
      expected.judge,
    );
    Object.values(repository).forEach((method) =>
      expect(method).toHaveBeenCalledWith("contest-42"),
    );
  });
});
