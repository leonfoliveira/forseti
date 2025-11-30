import { ContestRepository } from "@/core/port/driven/repository/ContestRepository";
import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { SubmissionRepository } from "@/core/port/driven/repository/SubmissionRepository";
import { DashboardReader } from "@/core/port/driving/usecase/dashboard/DashboardReader";
import { AdminDashboardResponseDTO } from "@/core/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/core/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { GuestDashboardResponseDTO } from "@/core/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/core/port/dto/response/dashboard/JudgeDashboardResponseDTO";

export class DashboardService implements DashboardReader {
  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly leaderboardRepository: LeaderboardRepository,
    private readonly submissionRepository: SubmissionRepository,
  ) {}

  /**
   * Get the admin dashboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The admin dashboard data
   */
  async getAdmin(contestId: string): Promise<AdminDashboardResponseDTO> {
    const [contest, leaderboard, submissions] = await Promise.all([
      this.contestRepository.findFullById(contestId),
      this.leaderboardRepository.build(contestId),
      this.submissionRepository.findAllFullForContest(contestId),
    ]);

    return {
      contest,
      leaderboard,
      submissions,
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
    const [contest, leaderboard, submissions, memberSubmissions] =
      await Promise.all([
        this.contestRepository.findById(contestId),
        this.leaderboardRepository.build(contestId),
        this.submissionRepository.findAllForContest(contestId),
        this.submissionRepository.findAllFullForMember(contestId),
      ]);

    return {
      contest,
      leaderboard,
      submissions,
      memberSubmissions,
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
    const [contest, leaderboard, submissions] = await Promise.all([
      this.contestRepository.findById(contestId),
      this.leaderboardRepository.build(contestId),
      this.submissionRepository.findAllFullForContest(contestId),
    ]);

    return {
      contest,
      leaderboard,
      submissions,
    };
  }
}
