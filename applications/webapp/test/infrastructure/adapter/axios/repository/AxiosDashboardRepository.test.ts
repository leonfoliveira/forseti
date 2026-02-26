import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { AxiosDashboardRepository } from "@/infrastructure/adapter/axios/repository/AxiosDashboardRepository";
import { MockAdminDashboardResponseDTO } from "@/test/mock/response/dashboard/MockAdminDashboardResponseDTO";
import { MockContestantDashboardResponseDTO } from "@/test/mock/response/dashboard/MockContestantDashboardResponseDTO";
import { MockGuestDashboardResponseDTO } from "@/test/mock/response/dashboard/MockGuestDashboardResponseDTO";
import { MockJudgeDashboardResponseDTO } from "@/test/mock/response/dashboard/MockJudgeDashboardResponseDTO";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/dashboard/MockStaffDashboardResponseDTO";

describe("AxiosDashboardRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosDashboardRepository(axiosClient);

  const contestId = uuidv4();

  describe("getAdminDashboard", () => {
    it("should return the admin dashboard", async () => {
      const expectedResponse = MockAdminDashboardResponseDTO();
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.getAdminDashboard(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/dashboard/admin`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getContestantDashboard", () => {
    it("should return the contestant dashboard", async () => {
      const expectedResponse = MockContestantDashboardResponseDTO();
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.getContestantDashboard(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/dashboard/contestant`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getGuestDashboard", () => {
    it("should return the guest dashboard", async () => {
      const expectedResponse = MockGuestDashboardResponseDTO();
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.getGuestDashboard(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/dashboard/guest`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getJudgeDashboard", () => {
    it("should return the judge dashboard", async () => {
      const expectedResponse = MockJudgeDashboardResponseDTO();
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.getJudgeDashboard(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/dashboard/judge`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getStaffDashboard", () => {
    it("should return the staff dashboard", async () => {
      const expectedResponse = MockStaffDashboardResponseDTO();
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.getStaffDashboard(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/dashboard/staff`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
