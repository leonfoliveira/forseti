import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { StaffClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/staff-clarifications-page";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page",
  () => ({
    ClarificationsPage: jest.fn(),
  }),
);

describe("StaffClarificationsPage", () => {
  it("should render common ClarificationsPage with correct data", async () => {
    const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
    const clarifications = [
      MockClarificationResponseDTO(),
      MockClarificationResponseDTO(),
    ];
    await renderWithProviders(<StaffClarificationsPage />, {
      staffDashboard: {
        problems,
        clarifications,
      },
    } as any);

    expect(ClarificationsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems,
        clarifications,
      }),
      undefined,
    );
  });
});
