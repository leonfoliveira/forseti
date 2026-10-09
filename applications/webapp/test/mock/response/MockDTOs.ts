import { AttachmentContext } from "@/domain/enumerate/AttachmentContext";
import { MemberType } from "@/domain/enumerate/MemberType";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { AuthenticateRequestDTO } from "@/port/dto/request/AuthenticateRequestDTO";
import { CreateSubmissionRequestDTO } from "@/port/dto/request/CreateSubmissionRequestDTO";
import { GetUploadSignedUrlRequest } from "@/port/dto/request/GetUploadSignedUrlRequest";
import { UpdateContestRequestDTO } from "@/port/dto/request/UpdateContestRequestDTO";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { SignedDownloadAttachmentResponseDTO } from "@/port/dto/response/attachment/SignedDownloadAttachmentResponseDTO";
import { SignedUploadAttachmentResponseDTO } from "@/port/dto/response/attachment/SignedUploadAttachmentResponseDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { ContestWithMembersAndProblemsDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsDTO";
import { AdminDashboardResponseDTO } from "@/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { ContestantDashboardResponseDTO } from "@/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { GuestDashboardResponseDTO } from "@/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { JudgeDashboardResponseDTO } from "@/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { ExecutionResponseDTO } from "@/port/dto/response/execution/ExecutionResponseDTO";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { MemberResponseDTO } from "@/port/dto/response/member/MemberResponseDTO";
import { MemberWithLoginResponseDTO } from "@/port/dto/response/member/MemberWithLoginResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";
import { ProblemWithTestCasesResponseDTO } from "@/port/dto/response/problem/ProblemWithTestCasesResponseDTO";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

const createdAt = "2026-01-01T00:00:00.000Z";

export const MockAttachmentResponseDTO = (
  overrides: Partial<AttachmentResponseDTO> = {},
): AttachmentResponseDTO => ({
  id: "attachment-1",
  createdAt,
  updatedAt: createdAt,
  filename: "file.txt",
  contentType: "text/plain",
  version: 1,
  ...overrides,
});

export const MockSignedDownloadAttachmentResponseDTO = (
  overrides: Partial<SignedDownloadAttachmentResponseDTO> = {},
): SignedDownloadAttachmentResponseDTO => ({
  attachment: MockAttachmentResponseDTO(),
  downloadUrl: "https://example.test/download",
  ...overrides,
});

export const MockSignedUploadAttachmentResponseDTO = (
  overrides: Partial<SignedUploadAttachmentResponseDTO> = {},
): SignedUploadAttachmentResponseDTO => ({
  attachment: MockAttachmentResponseDTO(),
  uploadUrl: "https://example.test/upload",
  ...overrides,
});

export const MockContestResponseDTO = (
  overrides: Partial<ContestResponseDTO> = {},
): ContestResponseDTO => ({
  id: "contest-1",
  createdAt,
  updatedAt: createdAt,
  slug: "test-slug",
  title: "Test contest",
  languages: [SubmissionLanguage.CPP_17],
  startAt: "2026-01-01T00:00:00.000Z",
  endAt: "2026-01-01T02:00:00.000Z",
  version: 1,
  ...overrides,
});

export const MockMemberResponseDTO = (
  overrides: Partial<MemberResponseDTO> = {},
): MemberResponseDTO => ({
  id: "member-1",
  createdAt,
  updatedAt: createdAt,
  type: MemberType.CONTESTANT,
  name: "Ada Lovelace",
  version: 1,
  ...overrides,
});

export const MockMemberWithLoginResponseDTO = (
  overrides: Partial<MemberWithLoginResponseDTO> = {},
): MemberWithLoginResponseDTO => ({
  ...MockMemberResponseDTO(),
  login: "ada",
  ...overrides,
});

export const MockProblemResponseDTO = (
  overrides: Partial<ProblemResponseDTO> = {},
): ProblemResponseDTO => ({
  id: "problem-1",
  createdAt,
  updatedAt: createdAt,
  letter: "A",
  color: "#336699",
  title: "First problem",
  description: MockAttachmentResponseDTO({ id: "description-1" }),
  timeLimit: 1000,
  memoryLimit: 256,
  version: 1,
  ...overrides,
});

export const MockProblemWithTestCasesResponseDTO = (
  overrides: Partial<ProblemWithTestCasesResponseDTO> = {},
): ProblemWithTestCasesResponseDTO => ({
  ...MockProblemResponseDTO(),
  testCases: MockAttachmentResponseDTO({ id: "test-cases-1" }),
  ...overrides,
});

export const MockSubmissionResponseDTO = (
  overrides: Partial<SubmissionResponseDTO> = {},
): SubmissionResponseDTO => ({
  id: "submission-1",
  createdAt,
  updatedAt: createdAt,
  problem: MockProblemResponseDTO(),
  member: MockMemberResponseDTO(),
  language: SubmissionLanguage.CPP_17,
  status: SubmissionStatus.JUDGED,
  answer: SubmissionAnswer.ACCEPTED,
  version: 1,
  ...overrides,
});

export const MockSubmissionWithCodeResponseDTO = (
  overrides: Partial<SubmissionWithCodeResponseDTO> = {},
): SubmissionWithCodeResponseDTO => ({
  ...MockSubmissionResponseDTO(),
  code: MockAttachmentResponseDTO({ id: "code-1", filename: "solution.cpp" }),
  ...overrides,
});

export const MockSubmissionWithCodeAndExecutionResponseDTO = (
  overrides: Partial<SubmissionWithCodeAndExecutionsResponseDTO> = {},
): SubmissionWithCodeAndExecutionsResponseDTO => ({
  ...MockSubmissionWithCodeResponseDTO(),
  executions: [MockExecutionResponseDTO({ id: "execution-1" })],
  ...overrides,
});

export const MockExecutionResponseDTO = (
  overrides: Partial<ExecutionResponseDTO> = {},
): ExecutionResponseDTO => ({
  id: "execution-1",
  createdAt,
  updatedAt: createdAt,
  answer: SubmissionAnswer.ACCEPTED,
  totalTestCases: 10,
  approvedTestCases: 10,
  maxCpuTimeMs: 1000,
  maxClockTimeMs: 1000,
  maxPeakMemoryKb: 1024,
  details: MockAttachmentResponseDTO({
    id: "details-1",
    filename: "details.log",
  }),
  version: 1,
  ...overrides,
});

export const MockLeaderboardCellResponseDTO = (
  overrides: Partial<LeaderboardCellResponseDTO> = {},
): LeaderboardCellResponseDTO => ({
  memberId: "member-1",
  problemId: "problem-1",
  problemLetter: "A",
  problemColor: "#336699",
  letter: "A",
  isAccepted: false,
  wrongSubmissions: 0,
  penalty: 0,
  ...overrides,
});

export const MockLeaderboardResponseDTO = (
  overrides: Partial<LeaderboardResponseDTO> = {},
): LeaderboardResponseDTO => ({
  contestId: "contest-1",
  contestStartAt: "2026-01-01T00:00:00.000Z",
  isFrozen: false,
  issuedAt: createdAt,
  rows: [
    {
      memberId: "member-1",
      memberName: "Ada Lovelace",
      memberType: MemberType.CONTESTANT,
      score: 0,
      penalty: 0,
      cells: [
        {
          problemId: "problem-1",
          problemLetter: "A",
          problemColor: "#336699",
          isAccepted: false,
          wrongSubmissions: 0,
          penalty: 0,
        },
      ],
    },
  ],
  ...overrides,
});

export const MockContestWithMembersAndProblemsDTO = (
  overrides: Partial<ContestWithMembersAndProblemsDTO> = {},
): ContestWithMembersAndProblemsDTO => ({
  ...MockContestResponseDTO(),
  members: [MockMemberWithLoginResponseDTO()],
  problems: [MockProblemWithTestCasesResponseDTO()],
  ...overrides,
});

export const MockSessionResponseDTO = (
  overrides: Partial<SessionResponseDTO> = {},
): SessionResponseDTO => ({
  id: "session-1",
  createdAt,
  updatedAt: createdAt,
  contestId: "contest-1",
  member: {
    id: "member-1",
    name: "Ada Lovelace",
    type: MemberType.CONTESTANT,
  },
  expiresAt: "2026-01-01T01:00:00.000Z",
  version: 1,
  ...overrides,
});

export const MockAdminDashboardResponseDTO = (
  overrides: Partial<AdminDashboardResponseDTO> = {},
): AdminDashboardResponseDTO => ({
  contest: MockContestWithMembersAndProblemsDTO(),
  leaderboard: MockLeaderboardResponseDTO(),
  members: [MockMemberWithLoginResponseDTO()],
  problems: [MockProblemWithTestCasesResponseDTO()],
  submissions: [MockSubmissionWithCodeAndExecutionResponseDTO()],
  ...overrides,
});

export const MockContestantDashboardResponseDTO = (
  overrides: Partial<ContestantDashboardResponseDTO> = {},
): ContestantDashboardResponseDTO => ({
  contest: MockContestResponseDTO(),
  leaderboard: MockLeaderboardResponseDTO(),
  members: [MockMemberResponseDTO()],
  problems: [MockProblemResponseDTO()],
  submissions: [MockSubmissionResponseDTO()],
  memberSubmissions: [MockSubmissionWithCodeResponseDTO()],
  ...overrides,
});

export const MockGuestDashboardResponseDTO = (
  overrides: Partial<GuestDashboardResponseDTO> = {},
): GuestDashboardResponseDTO => ({
  contest: MockContestResponseDTO(),
  leaderboard: MockLeaderboardResponseDTO(),
  members: [MockMemberResponseDTO()],
  problems: [MockProblemResponseDTO()],
  submissions: [MockSubmissionResponseDTO()],
  ...overrides,
});

export const MockJudgeDashboardResponseDTO = (
  overrides: Partial<JudgeDashboardResponseDTO> = {},
): JudgeDashboardResponseDTO => ({
  contest: MockContestResponseDTO(),
  leaderboard: MockLeaderboardResponseDTO(),
  members: [MockMemberResponseDTO({ type: MemberType.JUDGE })],
  problems: [MockProblemWithTestCasesResponseDTO()],
  submissions: [MockSubmissionWithCodeAndExecutionResponseDTO()],
  ...overrides,
});

export const MockAuthenticateRequestDTO = (
  overrides: Partial<AuthenticateRequestDTO> = {},
): AuthenticateRequestDTO => ({
  login: "ada",
  password: "secret",
  ...overrides,
});

export const MockCreateSubmissionRequestDTO = (
  overrides: Partial<CreateSubmissionRequestDTO> = {},
): CreateSubmissionRequestDTO => ({
  problemId: "problem-1",
  language: SubmissionLanguage.CPP_17,
  code: MockAttachmentResponseDTO({ id: "code-1" }),
  ...overrides,
});

export const MockGetUploadSignedUrlRequest = (
  overrides: Partial<GetUploadSignedUrlRequest> = {},
): GetUploadSignedUrlRequest => ({
  filename: "file.txt",
  context: AttachmentContext.PROBLEM_DESCRIPTION,
  contentType: "text/plain",
  ...overrides,
});

export const MockUpdateContestRequestDTO = (
  overrides: Partial<UpdateContestRequestDTO> = {},
): UpdateContestRequestDTO => ({
  slug: "test-slug",
  title: "Test contest",
  languages: [SubmissionLanguage.CPP_17],
  startAt: "2026-01-01T00:00:00.000Z",
  endAt: "2026-01-01T02:00:00.000Z",
  members: [
    { type: MemberType.CONTESTANT, name: "Ada Lovelace", login: "ada" },
  ],
  problems: [
    {
      letter: "A",
      color: "#336699",
      title: "First problem",
      description: MockAttachmentResponseDTO({ id: "description-1" }),
      timeLimit: 1000,
      memoryLimit: 256,
      testCases: MockAttachmentResponseDTO({ id: "test-cases-1" }),
    },
  ],
  ...overrides,
});
