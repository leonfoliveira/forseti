import { useState } from "react";

export type ModalHook = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export function useModal(): ModalHook {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
