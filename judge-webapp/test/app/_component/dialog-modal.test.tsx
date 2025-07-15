import { fireEvent, render, screen } from "@testing-library/react";
import { DialogModal } from "@/app/_component/dialog-modal";
import { ModalHook } from "@/app/_util/modal-hook";

describe("DialogModal", () => {
  it("should not render modal is it is closed", () => {
    const modal = {
      isOpen: false,
    } as unknown as ModalHook<unknown>;
    const mockOnConfirm = jest.fn();

    render(
      <DialogModal modal={modal} onConfirm={mockOnConfirm} isLoading={false}>
        <div>Test Content</div>
      </DialogModal>,
    );

    expect(screen.queryByTestId("dialog-modal")).not.toBeInTheDocument();
  });

  it("should close on cancel button click", () => {
    const modal = {
      isOpen: true,
      close: jest.fn(),
    } as unknown as ModalHook<unknown>;
    const mockOnConfirm = jest.fn();

    render(
      <DialogModal modal={modal} onConfirm={mockOnConfirm} isLoading={false}>
        <div>Test Content</div>
      </DialogModal>,
    );

    expect(screen.getByTestId("dialog-modal")).toBeInTheDocument();
    const cancelButton = screen.getByTestId("dialog-modal:cancel");
    fireEvent.click(cancelButton);
    expect(modal.close).toHaveBeenCalled();
  });

  it("should call onConfirm with props when confirm button is clicked", () => {
    const modalProps = { test: "data" };
    const modal = {
      isOpen: true,
      props: modalProps,
      close: jest.fn(),
    } as unknown as ModalHook<typeof modalProps>;
    const mockOnConfirm = jest.fn();

    render(
      <DialogModal modal={modal} onConfirm={mockOnConfirm} isLoading={false}>
        <div>Test Content</div>
      </DialogModal>,
    );

    expect(screen.getByTestId("dialog-modal")).toBeInTheDocument();
    const confirmButton = screen.getByTestId("dialog-modal:confirm");
    fireEvent.click(confirmButton);
    expect(mockOnConfirm).toHaveBeenCalledWith(modalProps);
  });
});
