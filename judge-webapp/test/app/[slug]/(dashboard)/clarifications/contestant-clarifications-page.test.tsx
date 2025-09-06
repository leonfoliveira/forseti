import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications-page";
import { ContestantClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/contestant-clarifications-page";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/clarifications-page", () => ({
  ClarificationsPage: jest.fn(),
}));

describe("ContestantClarificationsPage", () => {
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
    await renderWithProviders(<ContestantClarificationsPage />, {
      contestMetadata,
      contestantDashboard: {
        contest: { problems, clarifications },
      },
    } as any);

    expect(ClarificationsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        contestId: contestMetadata.id,
        problems,
        clarifications,
        canCreate: true,
      }),
      undefined,
    );
  });
});
