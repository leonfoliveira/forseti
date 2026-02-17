import { AdminDashboardResponseDTO } from "@/core/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/core/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { GuestDashboardResponseDTO } from "@/core/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/core/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { StaffDashboardResponseDTO } from "@/core/port/dto/response/dashboard/StaffDashboardResponseDTO";

export interface DashboardReader {
  /**
   * Get the admin dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The admin dashboard data
   */
  getAdmin(contestId: string): Promise<AdminDashboardResponseDTO>;

  /**
   * Get the staff dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The staff dashboard data
   */
  getStaff(contestId: string): Promise<StaffDashboardResponseDTO>;

  /**
   * Get the contestant dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The contestant dashboard data
   */
  getContestant(contestId: string): Promise<ContestantDashboardResponseDTO>;

  /**
   * Get the guest dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The guest dashboard data
   */
  getGuest(contestId: string): Promise<GuestDashboardResponseDTO>;

  /**
   * Get the judge dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The judge dashboard data
   */
  getJudge(contestId: string): Promise<JudgeDashboardResponseDTO>;
}
