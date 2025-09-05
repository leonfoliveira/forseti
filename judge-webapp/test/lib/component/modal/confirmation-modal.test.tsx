import { fireEvent, screen } from "@testing-library/dom";

import { ConfirmationModal } from "@/lib/component/modal/confirmation-modal";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ConfirmationModal", () => {
  it("should not render content when it is not open", async () => {
    await renderWithProviders(
      <ConfirmationModal
        isOpen={false}
        isLoading={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Title"
        body="Body"
      />,
    );

    expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument();
  });

  it("should render content when it is open", async () => {
    await renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        isLoading={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Title"
        body="Body"
      />,
    );

    expect(screen.queryByTestId("confirmation-modal")).toBeInTheDocument();
    expect(screen.getByTestId("title")).toHaveTextContent("Title");
    expect(screen.getByTestId("body")).toHaveTextContent("Body");
  });

  it("should call onClose when the cancel button is clicked", async () => {
    const onClose = jest.fn();
    await renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        isLoading={false}
        onClose={onClose}
        onConfirm={() => {}}
        title="Title"
        body="Body"
      />,
    );

    fireEvent.click(screen.getByTestId("cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  it("should call onConfirm when the confirm button is clicked", async () => {
    const onConfirm = jest.fn();
    await renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        isLoading={false}
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Title"
        body="Body"
      />,
    );

    fireEvent.click(screen.getByTestId("confirm"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("should not call onCancel when the cancel button is clicked while loading", async () => {
    const onClose = jest.fn();
    await renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        isLoading={true}
        onClose={onClose}
        onConfirm={() => {}}
        title="Title"
        body="Body"
      />,
    );

    fireEvent.click(screen.getByTestId("cancel"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should not call onCancel or onConfirm when the cancel button is clicked while loading", async () => {
    const onClose = jest.fn();
    await renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        isLoading={true}
        onClose={onClose}
        onConfirm={() => {}}
        title="Title"
        body="Body"
      />,
    );

    fireEvent.click(screen.getByTestId("confirm"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
