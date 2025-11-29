import { mock } from "jest-mock-extended";

import { DashboardService } from "@/core/application/service/DashboardService";
import { ContestRepository } from "@/core/port/driven/repository/ContestRepository";
import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { SubmissionRepository } from "@/core/port/driven/repository/SubmissionRepository";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import { MockContestPublicResponseDTO } from "@/test/mock/response/contest/MockContestPublicResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";

describe("DashboardService", () => {
  const contestRepository = mock<ContestRepository>();
  const leaderboardRepository = mock<LeaderboardRepository>();
  const submissionRepository = mock<SubmissionRepository>();

  const sut = new DashboardService(
    contestRepository,
    leaderboardRepository,
    submissionRepository,
  );

  describe("getAdmin", () => {
    it("should return the admin dashboard data", async () => {
      const contest = MockContestFullResponseDTO();
      const leaderboard = MockLeaderboardResponseDTO();
      const submissions = [MockSubmissionFullResponseDTO()];

      contestRepository.findFullContestById.mockResolvedValueOnce(contest);
      leaderboardRepository.findContestLeaderboard.mockResolvedValueOnce(
        leaderboard,
      );
      submissionRepository.findAllContestFullSubmissions.mockResolvedValueOnce(
        submissions,
      );

      const result = await sut.getAdmin("contest-id");

      expect(contestRepository.findFullContestById).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(leaderboardRepository.findContestLeaderboard).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(
        submissionRepository.findAllContestFullSubmissions,
      ).toHaveBeenCalledWith("contest-id");

      expect(result).toEqual({
        contest,
        leaderboard,
        submissions,
      });
    });
  });

  describe("getContestant", () => {
    it("should return the contestant dashboard data", async () => {
      const contest = MockContestPublicResponseDTO();
      const leaderboard = MockLeaderboardResponseDTO();
      const submissions = [MockSubmissionPublicResponseDTO()];
      const memberSubmissions = [MockSubmissionFullResponseDTO()];

      contestRepository.findContestById.mockResolvedValueOnce(contest);
      leaderboardRepository.findContestLeaderboard.mockResolvedValueOnce(
        leaderboard,
      );
      submissionRepository.findAllContestSubmissions.mockResolvedValueOnce(
        submissions,
      );
      submissionRepository.findAllFullForMember.mockResolvedValueOnce(
        memberSubmissions,
      );

      const result = await sut.getContestant("contest-id");

      expect(contestRepository.findContestById).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(leaderboardRepository.findContestLeaderboard).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(
        submissionRepository.findAllContestSubmissions,
      ).toHaveBeenCalledWith("contest-id");
      expect(submissionRepository.findAllFullForMember).toHaveBeenCalledWith(
        "contest-id",
      );

      expect(result).toEqual({
        contest,
        leaderboard,
        submissions,
        memberSubmissions,
      });
    });
  });

  describe("getGuest", () => {
    it("should return the guest dashboard data", async () => {
      const contest = MockContestPublicResponseDTO();
      const leaderboard = MockLeaderboardResponseDTO();
      const submissions = [MockSubmissionPublicResponseDTO()];

      contestRepository.findContestById.mockResolvedValueOnce(contest);
      leaderboardRepository.findContestLeaderboard.mockResolvedValueOnce(
        leaderboard,
      );
      submissionRepository.findAllContestSubmissions.mockResolvedValueOnce(
        submissions,
      );

      const result = await sut.getGuest("contest-id");

      expect(contestRepository.findContestById).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(leaderboardRepository.findContestLeaderboard).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(
        submissionRepository.findAllContestSubmissions,
      ).toHaveBeenCalledWith("contest-id");

      expect(result).toEqual({
        contest,
        leaderboard,
        submissions,
      });
    });
  });

  describe("getJudge", () => {
    it("should return the judge dashboard data", async () => {
      const contest = MockContestFullResponseDTO();
      const leaderboard = MockLeaderboardResponseDTO();
      const submissions = [MockSubmissionFullResponseDTO()];

      contestRepository.findFullContestById.mockResolvedValueOnce(contest);
      leaderboardRepository.findContestLeaderboard.mockResolvedValueOnce(
        leaderboard,
      );
      submissionRepository.findAllContestFullSubmissions.mockResolvedValueOnce(
        submissions,
      );

      const result = await sut.getJudge("contest-id");

      expect(contestRepository.findFullContestById).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(leaderboardRepository.findContestLeaderboard).toHaveBeenCalledWith(
        "contest-id",
      );
      expect(
        submissionRepository.findAllContestFullSubmissions,
      ).toHaveBeenCalledWith("contest-id");

      expect(result).toEqual({
        contest,
        leaderboard,
        submissions,
      });
    });
  });
});
