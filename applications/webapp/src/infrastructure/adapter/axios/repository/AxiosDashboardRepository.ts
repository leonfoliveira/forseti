import { DashboardRepository } from "@/core/port/driven/repository/DashboardRepository";
import { AdminDashboardResponseDTO } from "@/core/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/core/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { GuestDashboardResponseDTO } from "@/core/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/core/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { StaffDashboardResponseDTO } from "@/core/port/dto/response/dashboard/StaffDashboardResponseDTO";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosDashboardRepository implements DashboardRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/dashboard`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async getAdminDashboard(
    contestId: string,
  ): Promise<AdminDashboardResponseDTO> {
    const response = await this.axiosClient.get<AdminDashboardResponseDTO>(
      `${this.basePath(contestId)}/admin`,
    );
    return response.data;
  }

  async getContestantDashboard(
    contestId: string,
  ): Promise<ContestantDashboardResponseDTO> {
    const response = await this.axiosClient.get<ContestantDashboardResponseDTO>(
      `${this.basePath(contestId)}/contestant`,
    );
    return response.data;
  }

  async getGuestDashboard(
    contestId: string,
  ): Promise<GuestDashboardResponseDTO> {
    const response = await this.axiosClient.get<GuestDashboardResponseDTO>(
      `${this.basePath(contestId)}/guest`,
    );
    return response.data;
  }

  async getJudgeDashboard(
    contestId: string,
  ): Promise<JudgeDashboardResponseDTO> {
    const response = await this.axiosClient.get<JudgeDashboardResponseDTO>(
      `${this.basePath(contestId)}/judge`,
    );
    return response.data;
  }

  async getStaffDashboard(
    contestId: string,
  ): Promise<StaffDashboardResponseDTO> {
    const response = await this.axiosClient.get<StaffDashboardResponseDTO>(
      `${this.basePath(contestId)}/staff`,
    );
    return response.data;
  }
}
