import React from "react";
import { Button } from "@/app/_component/form/button";
import { ModalHook } from "@/app/_util/modal-hook";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("_component.dialog-modal");

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
            {t("cancel")}
          </Button>
          <Button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            data-testid={`${testId}:confirm`}
          >
            {t("confirm")}
          </Button>
        </div>
      </div>
    </dialog>
  ) : null;
}
