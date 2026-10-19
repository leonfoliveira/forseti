import { AdminDashboardResponseDTO } from "@/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { SpectatorDashboardResponseDTO } from "@/port/dto/response/dashboard/SpectatorDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { StaffDashboardResponseDTO } from "@/port/dto/response/dashboard/StaffDashboardResponseDTO";

export interface DashboardRepository {
  /**
   * Retrieves the admin dashboard for a specific contest.
   *
   * @param contestId - The ID of the contest for which to retrieve the admin dashboard.
   * @returns A promise that resolves to the admin dashboard response DTO.
   */
  getAdminDashboard(contestId: string): Promise<AdminDashboardResponseDTO>;

  /**
   * Retrieves the judge dashboard for a specific contest.
   *
   * @param contestId - The ID of the contest for which to retrieve the judge dashboard.
   * @returns A promise that resolves to the judge dashboard response DTO.
   */
  getJudgeDashboard(contestId: string): Promise<JudgeDashboardResponseDTO>;

  /**
   * Retrieves the staff dashboard for a specific contest.
   *
   * @param contestId - The ID of the contest for which to retrieve the staff dashboard.
   * @returns A promise that resolves to the staff dashboard response DTO.
   */
  getStaffDashboard(contestId: string): Promise<StaffDashboardResponseDTO>;

  /**
   * Retrieves the contestant dashboard for a specific contest.
   *
   * @param contestId - The ID of the contest for which to retrieve the contestant dashboard.
   * @returns A promise that resolves to the contestant dashboard response DTO.
   */
  getContestantDashboard(
    contestId: string,
  ): Promise<ContestantDashboardResponseDTO>;

  /**
   * Retrieves the spectator dashboard for a specific contest.
   *
   * @param contestId - The ID of the contest for which to retrieve the spectator dashboard.
   * @returns A promise that resolves to the spectator dashboard response DTO.
   */
  getSpectatorDashboard(
    contestId: string,
  ): Promise<SpectatorDashboardResponseDTO>;
}
