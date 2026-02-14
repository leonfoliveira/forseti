import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { AdminClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/admin-clarifications-page";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page",
  () => ({
    ClarificationsPage: jest.fn(),
  }),
);

describe("AdminClarificationsPage", () => {
  it("should render common ClarificationsPage with correct data", async () => {
    const problems = [
      MockProblemPublicResponseDTO(),
      MockProblemPublicResponseDTO(),
    ];
    const clarifications = [
      MockClarificationResponseDTO(),
      MockClarificationResponseDTO(),
    ];
    await renderWithProviders(<AdminClarificationsPage />, {
      adminDashboard: {
        contest: { problems, clarifications },
      },
    } as any);

    expect(ClarificationsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems,
        clarifications,
        canAnswer: true,
      }),
      undefined,
    );
  });
});
