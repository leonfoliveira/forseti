import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { AdminSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/admin-submissions-page";
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

describe("AdminSubmissionsPage", () => {
  it("should render common SubmissionsPage with correct data", async () => {
    const contest = MockContestResponseDTO();
    const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
    const submissions = [
      MockSubmissionResponseDTO(),
      MockSubmissionResponseDTO(),
    ];
    await renderWithProviders(<AdminSubmissionsPage />, {
      contest,
      adminDashboard: {
        problems,
        submissions,
      },
    } as any);

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions,
        problems,
        canEdit: true,
        onEdit: expect.any(Function),
      }),
      undefined,
    );
  });
});
