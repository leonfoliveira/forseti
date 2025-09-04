import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions-page";
import { JudgeSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/judge-submissions-page";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/submissions-page", () => ({
  SubmissionsPage: jest.fn(),
}));

describe("JudgeSubmissionsPage", () => {
  it("should render common SubmissionsPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const submissions = [
      MockSubmissionPublicResponseDTO(),
      MockSubmissionPublicResponseDTO(),
    ];
    await renderWithProviders(<JudgeSubmissionsPage />, {
      contestMetadata,
      judgeDashboard: {
        data: { submissions },
      },
    } as any);

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions,
        canEdit: true,
      }),
      undefined,
    );
  });
});
