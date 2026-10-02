import { render, screen } from "@testing-library/react";

import { ConfirmationDialog } from "@/app/_lib/component/feedback/ConfirmationDialog";

describe("ConfirmationDialog", () => {
  it("shows dialog content and disables actions while loading", () => {
    render(<ConfirmationDialog
      isOpen
      title="Delete item?"
      description="This cannot be undone."
      content={<span data-testid="extra-content">More detail</span>}
      onCancel={jest.fn()}
      onConfirm={jest.fn()}
      isLoading
    />);
    expect(screen.getByTestId("confirmation-dialog-title")).toHaveTextContent("Delete item?");
    expect(screen.getByTestId("confirmation-dialog-description")).toHaveTextContent("This cannot be undone.");
    expect(screen.getByTestId("extra-content")).toBeInTheDocument();
    expect(screen.getByTestId("confirmation-dialog-cancel-button")).toBeDisabled();
    expect(screen.getByTestId("confirmation-dialog-confirm-button")).toBeDisabled();
  });
});
