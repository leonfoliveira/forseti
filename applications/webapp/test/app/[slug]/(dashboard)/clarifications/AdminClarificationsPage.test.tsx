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
    const { store } = await renderWithProviders(<AdminClarificationsPage />, {
      adminDashboard: {
        problems,
        clarifications,
      },
    } as any);

    expect(ClarificationsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems,
        clarifications,
        onAnswer: expect.any(Function),
        onPublish: expect.any(Function),
      }),
      undefined,
    );

    const updatedClarification = MockClarificationResponseDTO();

    const onAnswer = (ClarificationsPage as jest.Mock).mock.calls[0][0]
      .onAnswer;
    onAnswer(updatedClarification);
    expect(store.getState().adminDashboard.clarifications).toContainEqual(
      updatedClarification,
    );

    const onPublish = (ClarificationsPage as jest.Mock).mock.calls[0][0]
      .onPublish;
    onPublish(updatedClarification);
    expect(store.getState().adminDashboard.clarifications).toContainEqual(
      updatedClarification,
    );
  });
});
