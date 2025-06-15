import { useState } from "react";

export type ModalHook<TProps> = {
  isOpen: boolean;
  props: TProps;
  open: (props?: TProps) => void;
  close: () => void;
};

/**
 * Utility hook to manage modal state.
 */
export function useModal<TProps>(): ModalHook<TProps> {
  const [state, setState] = useState({
    isOpen: false,
    props: undefined as TProps,
  });

  function open(props: TProps = undefined as TProps) {
    setState({
      isOpen: true,
      props,
    });
  }

  function close() {
    setState({
      isOpen: false,
      props: undefined as TProps,
    });
  }

  return {
    ...state,
    open,
    close,
  };
}
