import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { GuestSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/guest-submissions-page";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/submissions-page",
  () => ({
    SubmissionsPage: jest.fn(),
  }),
);

describe("GuestSubmissionsPage", () => {
  it("should render common SubmissionsPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const submissions = [
      MockSubmissionPublicResponseDTO(),
      MockSubmissionPublicResponseDTO(),
    ];
    await renderWithProviders(<GuestSubmissionsPage />, {
      contestMetadata,
      guestDashboard: {
        submissions,
      },
    } as any);

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions,
      }),
      undefined,
    );
  });
});
