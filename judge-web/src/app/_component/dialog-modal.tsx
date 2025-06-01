import React from "react";
import { Button } from "@/app/_component/form/button";
import { ModalHook } from "@/app/_util/modal-hook";
import { useTranslations } from "next-intl";

type Props = {
  children: React.ReactNode;
  modal: ModalHook;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  "data-testid"?: string;
};

export function DialogModal({
  children,
  modal,
  onConfirm,
  isLoading,
  ...props
}: Props) {
  const testId = props["data-testid"] || "dialog-modal";
  const t = useTranslations("_component.dialog-modal");

  async function handleConfirm() {
    await onConfirm();
    modal.close();
  }

  return modal.isOpen ? (
    <dialog className="modal modal-open" id="dialog" data-testid={testId}>
      <div className="modal-box">
        {children}
        <div className="modal-action">
          <Button
            className="btn btn-primary"
            onClick={modal.close}
            disabled={isLoading}
            data-testid={`${testId}:close`}
          >
            {t("cancel")}
          </Button>
          <Button
            className="btn btn-error"
            onClick={handleConfirm}
            disabled={isLoading}
            data-testid={`${testId}:confirm`}
          >
            {t("confirm")}
          </Button>
        </div>
      </div>
    </dialog>
  ) : null;
}
