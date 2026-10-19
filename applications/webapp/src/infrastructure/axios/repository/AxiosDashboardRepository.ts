import { DashboardRepository } from "@/port/output/repository/DashboardRepository";
import { AdminDashboardResponseDTO } from "@/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { SpectatorDashboardResponseDTO } from "@/port/dto/response/dashboard/SpectatorDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";
import { StaffDashboardResponseDTO } from "@/port/dto/response/dashboard/StaffDashboardResponseDTO";

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

  async getContestantDashboard(
    contestId: string,
  ): Promise<ContestantDashboardResponseDTO> {
    const response = await this.axiosClient.get<ContestantDashboardResponseDTO>(
      `${this.basePath(contestId)}/contestant`,
    );
    return response.data;
  }

  async getSpectatorDashboard(
    contestId: string,
  ): Promise<SpectatorDashboardResponseDTO> {
    const response = await this.axiosClient.get<SpectatorDashboardResponseDTO>(
      `${this.basePath(contestId)}/spectator`,
    );
    return response.data;
  }
}
