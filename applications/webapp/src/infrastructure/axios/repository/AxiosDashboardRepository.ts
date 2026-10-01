import { DashboardRepository } from "@/port/output/repository/DashboardRepository";
import { AdminDashboardResponseDTO } from "@/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { GuestDashboardResponseDTO } from "@/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";

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
}
