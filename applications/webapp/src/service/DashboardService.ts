import { DashboardRepository } from "@/port/output/repository/DashboardRepository";
import { DashboardReader } from "@/port/input/usecase/dashboard/DashboardReader";
import { AdminDashboardResponseDTO } from "@/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { GuestDashboardResponseDTO } from "@/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/port/dto/response/dashboard/JudgeDashboardResponseDTO";

export class DashboardService implements DashboardReader {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getAdminDashboard(
    contestId: string,
  ): Promise<AdminDashboardResponseDTO> {
    return await this.dashboardRepository.getAdminDashboard(contestId);
  }

  async getContestantDashboard(
    contestId: string,
  ): Promise<ContestantDashboardResponseDTO> {
    return await this.dashboardRepository.getContestantDashboard(contestId);
  }

  async getGuestDashboard(
    contestId: string,
  ): Promise<GuestDashboardResponseDTO> {
    return await this.dashboardRepository.getGuestDashboard(contestId);
  }

  async getJudgeDashboard(
    contestId: string,
  ): Promise<JudgeDashboardResponseDTO> {
    return await this.dashboardRepository.getJudgeDashboard(contestId);
  }
}
