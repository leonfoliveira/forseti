import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from "@heroui/react";
import { ReactNode } from "react";

import { defineMessages } from "@/i18n/message";
import { FormattedMessage } from "@/lib/component/format/formatted-message";

const messages = defineMessages({
  cancelLabel: {
    id: "lib.component.modal.confirmation-modal.cancel-label",
    defaultMessage: "Cancel",
  },
  confirmLabel: {
    id: "lib.component.modal.confirmation-modal.confirm-label",
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
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader data-testid="title">{title}</ModalHeader>
            <ModalBody data-testid="body">{body}</ModalBody>
            <ModalFooter>
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
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
