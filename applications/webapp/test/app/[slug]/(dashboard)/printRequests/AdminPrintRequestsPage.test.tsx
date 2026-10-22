import { MockPrintRequestResponseDTO } from "@/test/mock/response/MockDTOs";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/render-with-providers";
import { AdminPrintRequestsPage } from "@/app/[slug]/(dashboard)/printRequests/AdminPrintRequestsPage";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/printRequests/PrintRequestsPage",
  () => ({
    PrintRequestsPage: ({
      printRequests,
      canUpdate,
      onUpdate,
    }: {
      printRequests: any[];
      canUpdate: boolean;
      onUpdate: (req: any) => void;
    }) => (
      <div data-testid="print-requests-page">
        <span data-testid="can-update">{String(canUpdate)}</span>
        <span data-testid="requests-count">{printRequests.length}</span>
        <button
          data-testid="trigger-update-button"
          onClick={() => onUpdate({ ...printRequests[0], id: "updated-id" })}
        >
          Update
        </button>
      </div>
    ),
  }),
);

describe("AdminPrintRequestsPage", () => {
  it("should pass printRequests from store and canUpdate=true to PrintRequestsPage", async () => {
    const mockPrintRequest = MockPrintRequestResponseDTO();

    await renderWithProviders(<AdminPrintRequestsPage />, {
      adminDashboard: {
        printRequests: [mockPrintRequest],
      } as never,
    });

    expect(screen.getByTestId("print-requests-page")).toBeInTheDocument();
    expect(screen.getByTestId("can-update")).toHaveTextContent("true");
    expect(screen.getByTestId("requests-count")).toHaveTextContent("1");
  });

  it("should dispatch mergePrintRequest action when onUpdate is triggered", async () => {
    const mockPrintRequest = MockPrintRequestResponseDTO();

    const { store } = await renderWithProviders(<AdminPrintRequestsPage />, {
      adminDashboard: {
        printRequests: [mockPrintRequest],
      } as never,
    });

    fireEvent.click(screen.getByTestId("trigger-update-button"));

    expect(store.getState().adminDashboard.printRequests).toContainEqual({
      ...mockPrintRequest,
      id: "updated-id",
    });
  });
});
