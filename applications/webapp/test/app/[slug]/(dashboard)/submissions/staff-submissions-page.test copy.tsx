import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { StaffSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/staff-submissions-page";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { MockSubmissionResponseDTO } from "@/test/mock/response/submission/MockSubmissionResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/submissions-page",
  () => ({
    SubmissionsPage: jest.fn(),
  }),
);

describe("StaffSubmissionsPage", () => {
  it("should render common SubmissionsPage with correct data", async () => {
    const contest = MockContestResponseDTO();
    const submissions = [
      MockSubmissionResponseDTO(),
      MockSubmissionResponseDTO(),
    ];
    const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
    await renderWithProviders(<StaffSubmissionsPage />, {
      contest,
      staffDashboard: {
        submissions,
        problems,
      },
    } as any);

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems,
        submissions,
      }),
      undefined,
    );
  });
});
