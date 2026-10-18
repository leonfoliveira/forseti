import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPage";
import { StaffClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/StaffClarificationsPage";
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
