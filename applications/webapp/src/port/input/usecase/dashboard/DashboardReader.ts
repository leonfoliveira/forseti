import { AdminDashboardResponseDTO } from "@/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { GuestDashboardResponseDTO } from "@/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { StaffDashboardResponseDTO } from "@/port/dto/response/dashboard/StaffDashboardResponseDTO";

export interface DashboardReader {
  /**
   * Get the admin dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The admin dashboard data
   */
  getAdminDashboard(contestId: string): Promise<AdminDashboardResponseDTO>;

  /**
   * Get the judge dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The judge dashboard data
   */
  getJudgeDashboard(contestId: string): Promise<JudgeDashboardResponseDTO>;

  /**
   * Get the staff dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The staff dashboard data
   */
  getStaffDashboard(contestId: string): Promise<StaffDashboardResponseDTO>;

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
}
