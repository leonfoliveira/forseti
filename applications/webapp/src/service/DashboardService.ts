import { DashboardRepository } from "@/port/output/repository/DashboardRepository";
import { DashboardReader } from "@/port/input/usecase/dashboard/DashboardReader";
import { AdminDashboardResponseDTO } from "@/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { SpectatorDashboardResponseDTO } from "@/port/dto/response/dashboard/SpectatorDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { StaffDashboardResponseDTO } from "@/port/dto/response/dashboard/StaffDashboardResponseDTO";

export class DashboardService implements DashboardReader {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getAdminDashboard(
    contestId: string,
  ): Promise<AdminDashboardResponseDTO> {
    return await this.dashboardRepository.getAdminDashboard(contestId);
  }

  async getJudgeDashboard(
    contestId: string,
  ): Promise<JudgeDashboardResponseDTO> {
    return await this.dashboardRepository.getJudgeDashboard(contestId);
  }

  async getStaffDashboard(
    contestId: string,
  ): Promise<StaffDashboardResponseDTO> {
    return await this.dashboardRepository.getStaffDashboard(contestId);
  }

  async getContestantDashboard(
    contestId: string,
  ): Promise<ContestantDashboardResponseDTO> {
    return await this.dashboardRepository.getContestantDashboard(contestId);
  }

  async getSpectatorDashboard(
    contestId: string,
  ): Promise<SpectatorDashboardResponseDTO> {
    return await this.dashboardRepository.getSpectatorDashboard(contestId);
  }
}
