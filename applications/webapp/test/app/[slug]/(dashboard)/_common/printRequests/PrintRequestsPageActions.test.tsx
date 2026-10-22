import { PrintRequestsPageActions } from "@/app/[slug]/(dashboard)/_common/printRequests/PrintRequestsPageActions";
import { MockPrintRequestResponseDTO } from "@/test/mock/response/MockDTOs";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/render-with-providers";
import { useToast } from "@/app/_lib/hook/useToast";
import { Composition } from "@/config/composition";

jest.mock("@/app/_lib/component/form/AsyncButton", () => ({
  AsyncButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => <button {...props}>{children}</button>,
}));

describe("PrintRequestsPageActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show toast on print error", async () => {
    const printRequest = MockPrintRequestResponseDTO();
    (Composition.attachmentReader.print as jest.Mock).mockRejectedValueOnce(
      new Error("Print error"),
    );

    await renderWithProviders(
      <PrintRequestsPageActions
        printRequest={printRequest}
        onUpdate={jest.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("print-print-request-button"));
    });
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should print successfully", async () => {
    const printRequest = MockPrintRequestResponseDTO();

    await renderWithProviders(
      <PrintRequestsPageActions
        printRequest={printRequest}
        onUpdate={jest.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("print-print-request-button"));
    });
    expect(Composition.attachmentReader.print).toHaveBeenCalled();
  });

  it("should show error on complete error", async () => {
    const printRequest = MockPrintRequestResponseDTO();
    (
      Composition.printRequestWritter.updateStatus as jest.Mock
    ).mockRejectedValueOnce(new Error("Complete error"));

    await renderWithProviders(
      <PrintRequestsPageActions
        printRequest={printRequest}
        onUpdate={jest.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("complete-print-request-button"));
    });
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should complete successfully", async () => {
    const printRequest = MockPrintRequestResponseDTO();
    (
      Composition.printRequestWritter.updateStatus as jest.Mock
    ).mockResolvedValueOnce(printRequest);
    const onUpdate = jest.fn();

    await renderWithProviders(
      <PrintRequestsPageActions
        printRequest={printRequest}
        onUpdate={onUpdate}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("complete-print-request-button"));
    });
    expect(onUpdate).toHaveBeenCalledWith(printRequest);
  });

  it("should show error on reject error", async () => {
    const printRequest = MockPrintRequestResponseDTO();
    (
      Composition.printRequestWritter.updateStatus as jest.Mock
    ).mockRejectedValueOnce(new Error("Reject error"));

    await renderWithProviders(
      <PrintRequestsPageActions
        printRequest={printRequest}
        onUpdate={jest.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("reject-print-request-button"));
    });
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should reject successfully", async () => {
    const printRequest = MockPrintRequestResponseDTO();
    (
      Composition.printRequestWritter.updateStatus as jest.Mock
    ).mockResolvedValueOnce(printRequest);
    const onUpdate = jest.fn();

    await renderWithProviders(
      <PrintRequestsPageActions
        printRequest={printRequest}
        onUpdate={onUpdate}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("reject-print-request-button"));
    });
    expect(onUpdate).toHaveBeenCalledWith(printRequest);
  });
});
