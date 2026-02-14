import { screen } from "@testing-library/dom";

import { ConfirmationDialog } from "@/app/_lib/component/feedback/confirmation-dialog";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ConfirmationDialog", () => {
  it("renders with all components", async () => {
    await renderWithProviders(
      <ConfirmationDialog
        isOpen
        icon={<div data-testid="test-icon">Icon</div>}
        content={<div data-testid="test-content">Content</div>}
        title={{} as any}
        description={{} as any}
        onCancel={() => {}}
        onConfirm={async () => {}}
      />,
    );

    expect(screen.getByTestId("confirmation-dialog-icon")).toBeInTheDocument();
    expect(screen.getByTestId("confirmation-dialog-title")).toBeInTheDocument();
    expect(
      screen.getByTestId("confirmation-dialog-description"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(
      screen.getByTestId("confirmation-dialog-cancel-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("confirmation-dialog-confirm-button"),
    ).toBeInTheDocument();
  });

  it("should not render optional components when not provided", async () => {
    await renderWithProviders(
      <ConfirmationDialog
        isOpen
        title={{} as any}
        description={{} as any}
        onCancel={() => {}}
        onConfirm={async () => {}}
      />,
    );

    expect(
      screen.queryByTestId("confirmation-dialog-icon"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
  });

  it("calls correct callbacks when buttons are clicked", async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    await renderWithProviders(
      <ConfirmationDialog
        isOpen
        title={{} as any}
        description={{} as any}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    screen.getByTestId("confirmation-dialog-cancel-button").click();
    expect(onCancel).toHaveBeenCalled();
    screen.getByTestId("confirmation-dialog-confirm-button").click();
    expect(onConfirm).toHaveBeenCalled();
  });
});
