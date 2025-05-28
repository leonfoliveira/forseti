import React from "react";
import { Button } from "@/app/_component/form/button";
import { ModalHook } from "@/app/_util/modal-hook";

type Props = {
  children: React.ReactNode;
  modal: ModalHook;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
};

export function DialogModal({ children, modal, onConfirm, isLoading }: Props) {
  async function handleConfirm() {
    await onConfirm();
    modal.close();
  }

  return modal.isOpen ? (
    <dialog className="modal modal-open" id="dialog">
      <div className="modal-box">
        {children}
        <div className="modal-action">
          <Button
            className="btn btn-primary"
            onClick={modal.close}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="btn btn-error"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            Confirm
          </Button>
        </div>
      </div>
    </dialog>
  ) : null;
}
