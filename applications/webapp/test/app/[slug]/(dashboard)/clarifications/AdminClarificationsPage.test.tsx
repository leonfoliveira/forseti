import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPage";
import { AdminClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/AdminClarificationsPage";
import {
  MockClarificationResponseDTO,
  MockProblemResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPage",
  () => ({
    ClarificationsPage: jest.fn(),
  }),
);

describe("AdminClarificationsPage", () => {
  it("should render common ClarificationsPage with correct data", async () => {
    const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
    const clarifications = [
      MockClarificationResponseDTO(),
      MockClarificationResponseDTO(),
    ];
    await renderWithProviders(<AdminClarificationsPage />, {
      adminDashboard: {
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
