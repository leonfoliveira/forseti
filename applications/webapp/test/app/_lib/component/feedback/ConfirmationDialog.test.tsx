import { render, screen } from "@testing-library/react";

import { ConfirmationDialog } from "@/app/_lib/component/feedback/ConfirmationDialog";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ConfirmationDialog", () => {
  it("shows dialog content and disables actions while loading", async () => {
    await renderWithProviders(
      <ConfirmationDialog
        isOpen
        title="brand"
        description="brand"
        content={<span data-testid="extra-content">More detail</span>}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        isLoading
      />,
    );
    expect(screen.getByTestId("confirmation-dialog-title")).toHaveTextContent(
      "Forseti",
    );
    expect(
      screen.getByTestId("confirmation-dialog-description"),
    ).toHaveTextContent("Forseti");
    expect(screen.getByTestId("extra-content")).toBeInTheDocument();
    expect(
      screen.getByTestId("confirmation-dialog-cancel-button"),
    ).toBeDisabled();
    expect(
      screen.getByTestId("confirmation-dialog-confirm-button"),
    ).toBeDisabled();
  });
});
