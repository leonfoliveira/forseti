import { render, screen } from "@testing-library/react";

import { DialogModal } from "@/app/_component/modal/dialog-modal";

describe("DialogModal", () => {
  const modal = {
    isOpen: true,
    open: jest.fn(),
    close: jest.fn(),
    props: {},
  };

  it("renders a dialog modal with the given children", () => {
    render(
      <DialogModal modal={modal} onConfirm={() => {}} isLoading={false}>
        <div>My dialog modal</div>
      </DialogModal>
    );
    const dialogModal = screen.getByTestId("dialog-modal");
    expect(dialogModal).toBeInTheDocument();
    expect(dialogModal).toHaveTextContent("My dialog modal");
  });

  it("does not render the dialog modal when isOpen is false", () => {
    render(
      <DialogModal
        modal={{ ...modal, isOpen: false }}
        onConfirm={() => {}}
        isLoading={false}
      >
        <div>My dialog modal</div>
      </DialogModal>
    );
    const dialogModal = screen.queryByTestId("dialog-modal");
    expect(dialogModal).not.toBeInTheDocument();
  });
});
