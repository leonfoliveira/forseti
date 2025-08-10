import React from "react";
import { Button } from "@/app/_component/form/button";
import { ModalHook } from "@/app/_util/modal-hook";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  cancel: {
    id: "_component.modal.dialog-modal.cancel",
    defaultMessage: "Cancel",
  },
  confirm: {
    id: "_component.modal.dialog-modal.confirm",
    defaultMessage: "Confirm",
  },
});

type Props<TProps> = {
  children: React.ReactNode;
  modal: ModalHook<TProps>;
  onConfirm: (props: TProps) => Promise<void> | void;
  isLoading: boolean;
  "data-testid"?: string;
};

/**
 * DialogModal component is a reusable modal dialog that can be used to confirm actions.
 */
export function DialogModal<TProps>({
  children,
  modal,
  onConfirm,
  isLoading,
  ...props
}: Props<TProps>) {
  const testId = props["data-testid"] || "dialog-modal";

  async function handleConfirm() {
    await onConfirm(modal.props);
  }

  return modal.isOpen ? (
    <dialog className="modal modal-open z-10" id="dialog" data-testid={testId}>
      <div className="modal-box">
        {children}
        <div className="modal-action">
          <Button
            className="btn btn-soft"
            onClick={modal.close}
            disabled={isLoading}
            data-testid={`${testId}:cancel`}
          >
            <FormattedMessage {...messages.cancel} />
          </Button>
          <Button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            data-testid={`${testId}:confirm`}
          >
            <FormattedMessage {...messages.confirm} />
          </Button>
        </div>
      </div>
    </dialog>
  ) : null;
}
