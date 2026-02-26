import { AdminDashboardResponseDTO } from "@/core/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/core/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { GuestDashboardResponseDTO } from "@/core/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/core/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { StaffDashboardResponseDTO } from "@/core/port/dto/response/dashboard/StaffDashboardResponseDTO";

export interface DashboardRepository {
  /**
   * Retrieves the admin dashboard for a specific contest.
   *
   * @param contestId - The ID of the contest for which to retrieve the admin dashboard.
   * @returns A promise that resolves to the admin dashboard response DTO.
   */
  getAdminDashboard(contestId: string): Promise<AdminDashboardResponseDTO>;

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
   * Retrieves the guest dashboard for a specific contest.
   *
   * @param contestId - The ID of the contest for which to retrieve the guest dashboard.
   * @returns A promise that resolves to the guest dashboard response DTO.
   */
  getGuestDashboard(contestId: string): Promise<GuestDashboardResponseDTO>;

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
}
