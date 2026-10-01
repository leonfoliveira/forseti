import { AdminDashboardResponseDTO } from "@/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { GuestDashboardResponseDTO } from "@/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/port/dto/response/dashboard/JudgeDashboardResponseDTO";

export interface DashboardReader {
  /**
   * Get the admin dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The admin dashboard data
   */
  getAdminDashboard(contestId: string): Promise<AdminDashboardResponseDTO>;

  /**
   * Get the contestant dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The contestant dashboard data
   */
  getContestantDashboard(
    contestId: string,
  ): Promise<ContestantDashboardResponseDTO>;

  /**
   * Get the guest dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The guest dashboard data
   */
  getGuestDashboard(contestId: string): Promise<GuestDashboardResponseDTO>;

  /**
   * Get the judge dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The judge dashboard data
   */
  getJudgeDashboard(contestId: string): Promise<JudgeDashboardResponseDTO>;
}
