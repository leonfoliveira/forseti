import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions-page";
import { ContestantSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/contestant-submissions-page";
import { Language } from "@/core/domain/enumerate/Language";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/submissions-page", () => ({
  SubmissionsPage: jest.fn(),
}));

describe("ContestantSubmissionsPage", () => {
  it("should render common SubmissionsPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const problems = [
      MockProblemPublicResponseDTO(),
      MockProblemPublicResponseDTO(),
    ];
    const languages = [Language.CPP_17, Language.JAVA_21];
    const submissions = [
      MockSubmissionPublicResponseDTO(),
      MockSubmissionPublicResponseDTO(),
    ];
    await renderWithProviders(<ContestantSubmissionsPage />, {
      contestMetadata,
      contestantDashboard: {
        data: {
          contest: { problems, languages },
          submissions,
        },
      },
    } as any);

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions,
        problems,
        languages,
        canCreate: true,
      }),
      undefined,
    );
  });
});
