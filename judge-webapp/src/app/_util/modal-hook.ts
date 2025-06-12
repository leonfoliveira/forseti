import { useState } from "react";

export type ModalHook<TProps> = {
  isOpen: boolean;
  props: TProps | undefined;
  open: (props?: TProps | undefined) => void;
  close: () => void;
};

export function useModal<TProps>(): ModalHook<TProps> {
  const [state, setState] = useState({
    isOpen: false,
    props: undefined as TProps | undefined,
  });

  function open(props?: TProps) {
    setState({
      isOpen: true,
      props,
    });
  }

  function close() {
    setState({
      isOpen: false,
      props: undefined,
    });
  }

  return {
    ...state,
    open,
    close,
  };
}
