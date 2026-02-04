import { ReactNode } from "react";

import { Button } from "@/app/_lib/component/base/form/button";
import { Modal, ModalProps } from "@/app/_lib/component/base/overlay/modal";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  cancelLabel: {
    id: "app._lib.component.modal.confirmation-modal.cancel-label",
    defaultMessage: "Cancel",
  },
  confirmLabel: {
    id: "app._lib.component.modal.confirmation-modal.confirm-label",
    defaultMessage: "Confirm",
  },
});

type Props = Omit<ModalProps, "title" | "children"> & {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  body: ReactNode;
};

/**
 * A modal dialog that asks the user to confirm an action.
 * Displays a title, body content, and "Cancel" and "Confirm" buttons.
 */
export function ConfirmationModal({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
  title,
  body,
  ...props
}: Props) {
  return (
    <Modal
      data-testid="confirmation-modal"
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) {
          onClose();
        }
      }}
      {...props}
    >
      <Modal.Content>
        {(onClose) => (
          <>
            <Modal.Header data-testid="title">{title}</Modal.Header>
            <Modal.Body data-testid="body">{body}</Modal.Body>
            <Modal.Footer>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                isDisabled={isLoading}
                data-testid="cancel"
              >
                <FormattedMessage {...messages.cancelLabel} />
              </Button>
              <Button
                color="primary"
                isLoading={isLoading}
                onPress={onConfirm}
                data-testid="confirm"
              >
                <FormattedMessage {...messages.confirmLabel} />
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal.Content>
    </Modal>
  );
}
