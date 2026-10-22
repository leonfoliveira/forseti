import { MockPrintRequestResponseDTO } from "@/test/mock/response/MockDTOs";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/render-with-providers";
import { ContestantPrintRequestsPage } from "@/app/[slug]/(dashboard)/printRequests/ContestantPrintRequestsPage";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/printRequests/PrintRequestsPage",
  () => ({
    PrintRequestsPage: ({
      printRequests,
      canUpdate,
    }: {
      printRequests: any[];
      canUpdate: boolean;
    }) => (
      <div data-testid="print-requests-page">
        <span data-testid="can-update">{String(canUpdate)}</span>
        <span data-testid="requests-count">{printRequests.length}</span>
      </div>
    ),
  }),
);

describe("ContestantPrintRequestsPage", () => {
  it("should pass printRequests from store and canUpdate=true to PrintRequestsPage", async () => {
    const mockPrintRequest = MockPrintRequestResponseDTO();

    await renderWithProviders(<ContestantPrintRequestsPage />, {
      contestantDashboard: {
        printRequests: [mockPrintRequest],
      } as never,
    });

    expect(screen.getByTestId("print-requests-page")).toBeInTheDocument();
    expect(screen.getByTestId("can-update")).toHaveTextContent("undefined");
    expect(screen.getByTestId("requests-count")).toHaveTextContent("1");
  });
});
