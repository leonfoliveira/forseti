import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { GuestClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/guest-clarifications-page";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page",
  () => ({
    ClarificationsPage: jest.fn(),
  }),
);

describe("GuestClarificationsPage", () => {
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
    await renderWithProviders(<GuestClarificationsPage />, {
      contestMetadata,
      guestDashboard: {
        contest: { problems, clarifications },
      },
    } as any);

    expect(ClarificationsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        contestId: contestMetadata.id,
        problems,
        clarifications,
      }),
      undefined,
    );
  });
});
