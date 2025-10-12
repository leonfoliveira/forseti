import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems-page";
import { GuestProblemsPage } from "@/app/[slug]/(dashboard)/problems/guest-problems-page";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/problems-page", () => ({
  ProblemsPage: jest.fn(),
}));

describe("GuestProblemsPage", () => {
  it("should render common ProblemsPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const problems = [
      MockProblemPublicResponseDTO(),
      MockProblemPublicResponseDTO(),
    ];
    await renderWithProviders(<GuestProblemsPage />, {
      contestMetadata,
      guestDashboard: {
        contest: { problems },
      },
    } as any);

    expect(ProblemsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems,
      }),
      undefined,
    );
  });
});
