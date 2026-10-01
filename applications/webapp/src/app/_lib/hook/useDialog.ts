import { useState } from "react";

export function useDialog(isOpenDefault = false) {
  const [isOpen, setIsOpen] = useState<boolean>(isOpenDefault);

  function open() {
    setIsOpen(true);
  }

  function close() {
    // Radix adds "pointer-events: none" to the body when the dialog is open.
    // It removes it when the dialog is closed, but if the component is dismounted before that happens,
    // the body will be left with "pointer-events: none", which breaks the entire app.
    // To prevent this, we manually reset the body's style when closing the dialog.
    document.body.style.pointerEvents = "auto";
    setIsOpen(false);
  }

  return {
    isOpen,
    open,
    close,
  };
}
