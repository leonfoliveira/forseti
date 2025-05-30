import { render, screen } from "@testing-library/react";
import { DialogModal } from "@/app/_component/dialog-modal";

it("renders the modal when modal is open", async () => {
  const modal = {
    isOpen: true,
    open: jest.fn(),
    close: jest.fn(),
  };
  render(
    <DialogModal modal={modal} onConfirm={jest.fn()} isLoading={false}>
      Modal Content
    </DialogModal>,
  );
  expect(screen.getByTestId("dialog-modal")).toBeInTheDocument();
  expect(screen.getByText("Modal Content")).toBeInTheDocument();
});

it("does not render the modal when modal is closed", () => {
  const modal = {
    isOpen: false,
    open: jest.fn(),
    close: jest.fn(),
  };
  render(
    <DialogModal modal={modal} onConfirm={jest.fn()} isLoading={false}>
      Modal Content
    </DialogModal>,
  );
  expect(screen.queryByTestId("dialog-modal")).not.toBeInTheDocument();
});

it("calls modal.close when the cancel button is clicked", () => {
  const modal = {
    isOpen: true,
    open: jest.fn(),
    close: jest.fn(),
  };
  render(
    <DialogModal modal={modal} onConfirm={jest.fn()} isLoading={false}>
      Modal Content
    </DialogModal>,
  );
  screen.getByTestId("dialog-modal:close").click();
  expect(modal.close).toHaveBeenCalled();
});

it("calls onConfirm and modal.close when the confirm button is clicked", async () => {
  const modal = {
    isOpen: true,
    open: jest.fn(),
    close: jest.fn(),
  };
  const onConfirm = jest.fn().mockResolvedValue(undefined);
  render(
    <DialogModal modal={modal} onConfirm={onConfirm} isLoading={false}>
      Modal Content
    </DialogModal>,
  );
  screen.getByTestId("dialog-modal:confirm").click();
  expect(onConfirm).toHaveBeenCalled();
  expect(modal.close).toHaveBeenCalled();
});

it("disables buttons when isLoading is true", () => {
  const modal = {
    isOpen: true,
    open: jest.fn(),
    close: jest.fn(),
  };
  render(
    <DialogModal modal={modal} onConfirm={jest.fn()} isLoading={true}>
      Modal Content
    </DialogModal>,
  );
  expect(screen.getByTestId("dialog-modal:close")).toBeDisabled();
  expect(screen.getByTestId("dialog-modal:confirm")).toBeDisabled();
});
