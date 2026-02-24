import { mock } from "jest-mock-extended";

import { DashboardService } from "@/core/application/service/DashboardService";
import { MockAdminDashboardResponseDTO } from "@/test/mock/response/dashboard/MockAdminDashboardResponseDTO";
import { MockContestantDashboardResponseDTO } from "@/test/mock/response/dashboard/MockContestantDashboardResponseDTO";
import { MockGuestDashboardResponseDTO } from "@/test/mock/response/dashboard/MockGuestDashboardResponseDTO";
import { MockJudgeDashboardResponseDTO } from "@/test/mock/response/dashboard/MockJudgeDashboardResponseDTO";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/dashboard/MockStaffDashboardResponseDTO";

describe("DashboardService", () => {
  const dashboardService = mock<DashboardService>();

  const sut = new DashboardService(dashboardService);

  describe("getAdminDashboard", () => {
    it("should return the admin dashboard data", async () => {
      const dashboard = MockAdminDashboardResponseDTO();

      dashboardService.getAdminDashboard.mockResolvedValue(dashboard);
      const result = await sut.getAdminDashboard("contest-id");

      expect(dashboardService.getAdminDashboard).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(result).toEqual(dashboard);
    });
  });

  describe("getContestantDashboard", () => {
    it("should return the contestant dashboard data", async () => {
      const dashboard = MockContestantDashboardResponseDTO();

      dashboardService.getContestantDashboard.mockResolvedValue(dashboard);
      const result = await sut.getContestantDashboard("contest-id");

      expect(dashboardService.getContestantDashboard).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(result).toEqual(dashboard);
    });
  });

  describe("getGuestDashboard", () => {
    it("should return the guest dashboard data", async () => {
      const dashboard = MockGuestDashboardResponseDTO();

      dashboardService.getGuestDashboard.mockResolvedValue(dashboard);
      const result = await sut.getGuestDashboard("contest-id");

      expect(dashboardService.getGuestDashboard).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(result).toEqual(dashboard);
    });
  });

  describe("getJudgeDashboard", () => {
    it("should return the judge dashboard data", async () => {
      const dashboard = MockJudgeDashboardResponseDTO();

      dashboardService.getJudgeDashboard.mockResolvedValue(dashboard);
      const result = await sut.getJudgeDashboard("contest-id");

      expect(dashboardService.getJudgeDashboard).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(result).toEqual(dashboard);
    });
  });

  describe("getStaffDashboard", () => {
    it("should return the staff dashboard data", async () => {
      const dashboard = MockStaffDashboardResponseDTO();

      dashboardService.getStaffDashboard.mockResolvedValue(dashboard);
      const result = await sut.getStaffDashboard("contest-id");

      expect(dashboardService.getStaffDashboard).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(result).toEqual(dashboard);
    });
  });
});
