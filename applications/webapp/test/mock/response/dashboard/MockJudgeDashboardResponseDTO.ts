import { JudgeDashboardResponseDTO } from "@/core/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockMemberWithLoginResponseDTO } from "@/test/mock/response/member/MockMemberWithLoginResponseDTO";
import { MockProblemWithTestCasesResponseDTO } from "@/test/mock/response/problem/MockProblemWithTestCasesResponseDTO";
import { MockSubmissionWithCodeAndExecutionsResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeAndExecutionsResponseDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";

export function MockJudgeDashboardResponseDTO(
  partial: Partial<JudgeDashboardResponseDTO> = {},
): JudgeDashboardResponseDTO {
  return {
    contest: MockContestResponseDTO(),
    leaderboard: MockLeaderboardResponseDTO(),
    members: [MockMemberWithLoginResponseDTO()],
    problems: [MockProblemWithTestCasesResponseDTO()],
    submissions: [MockSubmissionWithCodeAndExecutionsResponseDTO()],
    clarifications: [MockClarificationResponseDTO()],
    announcements: [MockAnnouncementResponseDTO()],
    memberTickets: [MockTicketResponseDTO()],
    ...partial,
  };
}
