import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPage";
import { ContestantClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/ContestantClarificationsPage";
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

describe("ContestantClarificationsPage", () => {
  it("should render common ClarificationsPage with correct data", async () => {
    const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
    const clarifications = [
      MockClarificationResponseDTO(),
      MockClarificationResponseDTO(),
    ];
    const { store } = await renderWithProviders(
      <ContestantClarificationsPage />,
      {
        contestantDashboard: {
          problems,
          clarifications,
        },
      } as any,
    );

    expect(ClarificationsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems,
        clarifications,
        onCreate: expect.any(Function),
      }),
      undefined,
    );

    const onCreate = (ClarificationsPage as jest.Mock).mock.calls[0][0]
      .onCreate;
    const newClarification = MockClarificationResponseDTO();
    onCreate(newClarification);
    expect(store.getState().contestantDashboard.clarifications).toContainEqual(
      newClarification,
    );
  });
});
