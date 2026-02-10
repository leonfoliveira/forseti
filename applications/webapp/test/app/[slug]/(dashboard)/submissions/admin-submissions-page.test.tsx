import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { AdminSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/admin-submissions-page";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/submissions-page",
  () => ({
    SubmissionsPage: jest.fn(),
  }),
);

describe("AdminSubmissionsPage", () => {
  it("should render common SubmissionsPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const problems = [
      MockProblemPublicResponseDTO(),
      MockProblemPublicResponseDTO(),
    ];
    const submissions = [
      MockSubmissionPublicResponseDTO(),
      MockSubmissionPublicResponseDTO(),
    ];
    await renderWithProviders(<AdminSubmissionsPage />, {
      contestMetadata,
      adminDashboard: {
        contest: { problems },
        submissions,
      },
    } as any);

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions,
        problems,
        canEdit: true,
      }),
      undefined,
    );
  });
});
