import { DashboardRepository } from "@/core/port/driven/repository/DashboardRepository";
import { DashboardReader } from "@/core/port/driving/usecase/dashboard/DashboardReader";
import { AdminDashboardResponseDTO } from "@/core/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/core/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { GuestDashboardResponseDTO } from "@/core/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/core/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { StaffDashboardResponseDTO } from "@/core/port/dto/response/dashboard/StaffDashboardResponseDTO";

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

  async getStaffDashboard(
    contestId: string,
  ): Promise<StaffDashboardResponseDTO> {
    return await this.dashboardRepository.getStaffDashboard(contestId);
  }
}
