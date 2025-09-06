import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications-page";
import { JudgeClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/judge-clarifications-page";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/clarifications-page", () => ({
  ClarificationsPage: jest.fn(),
}));

describe("JudgeClarificationsPage", () => {
  it("should render common ClarificationsPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const problems = [
      MockProblemPublicResponseDTO(),
      MockProblemPublicResponseDTO(),
    ];
    const clarifications = [
      MockClarificationResponseDTO(),
      MockClarificationResponseDTO(),
    ];
    await renderWithProviders(<JudgeClarificationsPage />, {
      contestMetadata,
      judgeDashboard: {
        contest: { problems, clarifications },
      },
    } as any);

    expect(ClarificationsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        contestId: contestMetadata.id,
        problems,
        clarifications,
        canAnswer: true,
      }),
      undefined,
    );
  });
});
