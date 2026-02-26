import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { GuestSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/guest-submissions-page";
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

describe("GuestSubmissionsPage", () => {
  it("should render common SubmissionsPage with correct data", async () => {
    const contest = MockContestResponseDTO();
    const submissions = [
      MockSubmissionResponseDTO(),
      MockSubmissionResponseDTO(),
    ];
    const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
    await renderWithProviders(<GuestSubmissionsPage />, {
      contest,
      guestDashboard: {
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
