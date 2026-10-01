import React from "react";

import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
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
  title: string;
  description: string;
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
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription data-testid="confirmation-dialog-description">
            {description}
          </AlertDialogDescription>
          {content}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            data-testid="confirmation-dialog-cancel-button"
          >
            Cancel
          </AlertDialogCancel>
          <AsyncButton
            isLoading={isLoading}
            onClick={onConfirm}
            data-testid="confirmation-dialog-confirm-button"
          >
            Confirm
          </AsyncButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
