import type { ParseKeys } from "i18next";
import React from "react";

import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
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

type Props = {
  isOpen: boolean;
  icon?: React.ReactNode;
  title: ParseKeys;
  description: ParseKeys;
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
            <FormattedMessage id={title} />
          </AlertDialogTitle>
          <AlertDialogDescription data-testid="confirmation-dialog-description">
            <FormattedMessage id={description} />
          </AlertDialogDescription>
          {content}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            data-testid="confirmation-dialog-cancel-button"
          >
            <FormattedMessage id="_lib.component.feedback.ConfirmationDialog.cancel" />
          </AlertDialogCancel>
          <AsyncButton
            isLoading={isLoading}
            onClick={onConfirm}
            data-testid="confirmation-dialog-confirm-button"
          >
            <FormattedMessage id="_lib.component.feedback.ConfirmationDialog.confirm" />
          </AsyncButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
