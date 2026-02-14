import React, { useState } from "react";

import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/app/_lib/component/shadcn/alert-dialog";
import { defineMessages, Message } from "@/i18n/message";

const messages = defineMessages({
  cancelButton: {
    id: "app._lib.component.feedback.confirmation-dialog.cancel-button",
    defaultMessage: "Cancel",
  },
  confirmButton: {
    id: "app._lib.component.feedback.confirmation-dialog.confirm-button",
    defaultMessage: "Confirm",
  },
});

type Props = {
  isOpen: boolean;
  icon?: React.ReactNode;
  title: Message;
  description: Message;
  content?: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
};

export function ConfirmationDialog({
  isOpen,
  icon,
  title,
  description,
  content,
  onCancel,
  onConfirm,
  isLoading,
}: Props) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={onCancel}
      data-testid="confirmation-dialog"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          {icon && (
            <AlertDialogMedia data-testid="confirmation-dialog-icon">
              {icon}
            </AlertDialogMedia>
          )}
          <AlertDialogTitle data-testid="confirmation-dialog-title">
            <FormattedMessage {...title} />
          </AlertDialogTitle>
          <AlertDialogDescription data-testid="confirmation-dialog-description">
            <FormattedMessage {...description} />
          </AlertDialogDescription>
          {content}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            data-testid="confirmation-dialog-cancel-button"
          >
            <FormattedMessage {...messages.cancelButton} />
          </AlertDialogCancel>
          <AsyncButton
            isLoading={isLoading}
            onClick={onConfirm}
            data-testid="confirmation-dialog-confirm-button"
          >
            <FormattedMessage {...messages.confirmButton} />
          </AsyncButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function useConfirmationDialog(isOpenDefault = false) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return {
    isOpen,
    open,
    close,
  };
}
