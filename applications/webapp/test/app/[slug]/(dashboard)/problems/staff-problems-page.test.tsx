import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/problems-page";
import { StaffProblemsPage } from "@/app/[slug]/(dashboard)/problems/staff-problems-page";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/problems-page", () => ({
  ProblemsPage: jest.fn(),
}));

describe("StaffProblemsPage", () => {
  it("should render common ProblemsPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const problems = [
      MockProblemPublicResponseDTO(),
      MockProblemPublicResponseDTO(),
    ];
    await renderWithProviders(<StaffProblemsPage />, {
      contestMetadata,
      staffDashboard: {
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
