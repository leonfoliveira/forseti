import { render, screen } from "@testing-library/react";
import { ToastBox } from "@/app/_component/notification/toast-box";
import {
  ToastLevel,
  toastsSlice,
  ToastType,
} from "@/store/slices/toasts-slice";
import { mockAppDispatch, mockUseAppSelector } from "@/test/jest.setup";

jest.mock("@/app/_component/notification/toast", () => ({
  Toast: ({
    toast,
    onClose,
  }: {
    toast: ToastType;
    onClose: (id: string) => void;
  }) => (
    <div data-testid="toast" onClick={() => onClose(toast.id)}>
      {toast.text.defaultMessage}
    </div>
  ),
}));

describe("ToastBox", () => {
  it("renders multiple toasts", () => {
    const toasts = [
      {
        id: "1",
        text: { id: "toast-1", defaultMessage: "Test message 1" },
        level: ToastLevel.INFO,
        ttl: 5000,
      },
      {
        id: "2",
        text: { id: "toast-2", defaultMessage: "Test message 2" },
        level: ToastLevel.SUCCESS,
        ttl: 5000,
      },
    ] as ToastType[];
    mockUseAppSelector.mockReturnValue(toasts);
    render(<ToastBox />);
    const toastElements = screen.getAllByTestId("toast");
    expect(toastElements).toHaveLength(2);
    expect(toastElements[0]).toHaveTextContent("Test message 1");
    expect(toastElements[1]).toHaveTextContent("Test message 2");
  });

  it("calls onClose when a toast is closed", () => {
    const toasts = [
      {
        id: "1",
        text: { id: "toast-1", defaultMessage: "Test message 1" },
        level: ToastLevel.INFO,
        ttl: 5000,
      },
    ] as ToastType[];
    mockUseAppSelector.mockReturnValue(toasts);
    render(<ToastBox />);
    const toastElement = screen.getByTestId("toast");
    toastElement.click();
    expect(mockAppDispatch).toHaveBeenCalledWith(
      toastsSlice.actions.close("1"),
    );
  });
});
