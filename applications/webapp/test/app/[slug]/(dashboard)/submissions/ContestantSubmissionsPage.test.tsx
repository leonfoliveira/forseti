import { screen } from "@testing-library/react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";
import { ContestantSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/ContestantSubmissionsPage";
import { MockContestantDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage",
  () => ({
    SubmissionsPage: jest.fn(),
  }),
);

describe("ContestantSubmissionsPage", () => {
  it("passes member submissions and enables submission creation", async () => {
    const contestantDashboard = MockContestantDashboardResponseDTO();

    const { store } = await renderWithProviders(<ContestantSubmissionsPage />, {
      contestantDashboard,
    });

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions: contestantDashboard.submissions,
        problems: contestantDashboard.problems,
        memberSubmissions: contestantDashboard.memberSubmissions,
        onCreate: expect.any(Function),
        onCreatePrintRequest: expect.any(Function),
      }),
      undefined,
    );

    const onCreate = (SubmissionsPage as jest.Mock).mock.calls[0][0].onCreate;
    const onCreatePrintRequest = (SubmissionsPage as jest.Mock).mock.calls[0][0]
      .onCreatePrintRequest;

    const newSubmission = { id: "new-submission" };
    onCreate(newSubmission);
    expect(store.getState().contestantDashboard.submissions).toContainEqual(
      newSubmission,
    );

    const newPrintRequest = { id: "new-print-request" };
    onCreatePrintRequest(newPrintRequest);
    expect(store.getState().contestantDashboard.printRequests).toContainEqual(
      newPrintRequest,
    );
  });
});
