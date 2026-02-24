import { GuestDashboardResponseDTO } from "@/core/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockMemberResponseDTO } from "@/test/mock/response/member/MockMemberResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { MockSubmissionResponseDTO } from "@/test/mock/response/submission/MockSubmissionResponseDTO";

export function MockGuestDashboardResponseDTO(
  partial: Partial<GuestDashboardResponseDTO> = {},
): GuestDashboardResponseDTO {
  return {
    contest: MockContestResponseDTO(),
    leaderboard: MockLeaderboardResponseDTO(),
    members: [MockMemberResponseDTO()],
    problems: [MockProblemResponseDTO()],
    submissions: [MockSubmissionResponseDTO()],
    clarifications: [MockClarificationResponseDTO()],
    announcements: [MockAnnouncementResponseDTO()],
    ...partial,
  };
}
