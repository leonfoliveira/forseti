import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { JudgeClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/judge-clarifications-page";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page",
  () => ({
    ClarificationsPage: jest.fn(),
  }),
);

describe("JudgeClarificationsPage", () => {
  it("should render common ClarificationsPage with correct data", async () => {
    const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
    const clarifications = [
      MockClarificationResponseDTO(),
      MockClarificationResponseDTO(),
    ];
    await renderWithProviders(<JudgeClarificationsPage />, {
      judgeDashboard: {
        problems,
        clarifications,
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
