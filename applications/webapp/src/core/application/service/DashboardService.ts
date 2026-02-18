import { ContestRepository } from "@/core/port/driven/repository/ContestRepository";
import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { SubmissionRepository } from "@/core/port/driven/repository/SubmissionRepository";
import { TicketRepository } from "@/core/port/driven/repository/TicketRepository";
import { DashboardReader } from "@/core/port/driving/usecase/dashboard/DashboardReader";
import { AdminDashboardResponseDTO } from "@/core/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/core/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { GuestDashboardResponseDTO } from "@/core/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/core/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { StaffDashboardResponseDTO } from "@/core/port/dto/response/dashboard/StaffDashboardResponseDTO";

export class DashboardService implements DashboardReader {
  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly leaderboardRepository: LeaderboardRepository,
    private readonly submissionRepository: SubmissionRepository,
    private readonly ticketRepository: TicketRepository,
  ) {}

  /**
   * Get the admin dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The admin dashboard data
   */
  async getAdmin(contestId: string): Promise<AdminDashboardResponseDTO> {
    const [contest, leaderboard, submissions, tickets] = await Promise.all([
      this.contestRepository.findFullById(contestId),
      this.leaderboardRepository.build(contestId),
      this.submissionRepository.findAllFullForContest(contestId),
      this.ticketRepository.findAllByContest(contestId),
    ]);

    return {
      contest,
      leaderboard,
      submissions,
      tickets,
    };
  }

  /**
   * Get the staff dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The staff dashboard data
   */
  async getStaff(contestId: string): Promise<StaffDashboardResponseDTO> {
    const [contest, leaderboard, submissions, tickets] = await Promise.all([
      this.contestRepository.findById(contestId),
      this.leaderboardRepository.build(contestId),
      this.submissionRepository.findAllForContest(contestId),
      this.ticketRepository.findAllByContest(contestId),
    ]);

    return {
      contest,
      leaderboard,
      submissions,
      tickets,
    };
  }

  /**
   * Get the contestant dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The contestant dashboard data
   */
  async getContestant(
    contestId: string,
  ): Promise<ContestantDashboardResponseDTO> {
    const [
      contest,
      leaderboard,
      submissions,
      memberSubmissions,
      memberTickets,
    ] = await Promise.all([
      this.contestRepository.findById(contestId),
      this.leaderboardRepository.build(contestId),
      this.submissionRepository.findAllForContest(contestId),
      this.submissionRepository.findAllFullForMember(contestId),
      this.ticketRepository.findAllBySignedInMember(contestId),
    ]);

    return {
      contest,
      leaderboard,
      submissions,
      memberSubmissions,
      memberTickets,
    };
  }

  /**
   * Get the guest dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The guest dashboard data
   */
  async getGuest(contestId: string): Promise<GuestDashboardResponseDTO> {
    const [contest, leaderboard, submissions] = await Promise.all([
      this.contestRepository.findById(contestId),
      this.leaderboardRepository.build(contestId),
      this.submissionRepository.findAllForContest(contestId),
    ]);

    return {
      contest,
      leaderboard,
      submissions,
    };
  }

  /**
   * Get the judge dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The judge dashboard data
   */
  async getJudge(contestId: string): Promise<JudgeDashboardResponseDTO> {
    const [contest, leaderboard, submissions, memberTickets] =
      await Promise.all([
        this.contestRepository.findById(contestId),
        this.leaderboardRepository.build(contestId),
        this.submissionRepository.findAllFullForContest(contestId),
        this.ticketRepository.findAllBySignedInMember(contestId),
      ]);

    return {
      contest,
      leaderboard,
      submissions,
      memberTickets,
    };
  }
}
