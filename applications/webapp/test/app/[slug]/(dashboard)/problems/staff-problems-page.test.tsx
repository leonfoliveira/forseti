import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/problems-page";
import { StaffProblemsPage } from "@/app/[slug]/(dashboard)/problems/staff-problems-page";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/problems-page", () => ({
  ProblemsPage: jest.fn(),
}));

describe("StaffProblemsPage", () => {
  it("should render common ProblemsPage with correct data", async () => {
    const contest = MockContestResponseDTO();
    const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
    await renderWithProviders(<StaffProblemsPage />, {
      contest,
      staffDashboard: {
        problems,
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
