import { useCallback, useState } from "react";
import { UnwrapPromise } from "next/dist/lib/coalesced-function";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionFn = (...args: any[]) => any;

type ActionState<TData> = {
  isLoading: boolean;
  error?: Error;
  data?: TData;
};

type ActionType<TFn extends ActionFn> = {
  isLoading: boolean;
  error?: Error;
  data?: UnwrapPromise<ReturnType<TFn>>;
  act: (...args: Parameters<TFn>) => Promise<ReturnType<TFn>>;
  setData: (
    cb: (
      data?: UnwrapPromise<ReturnType<TFn>>,
    ) => UnwrapPromise<ReturnType<TFn>>,
  ) => void;
};

export function useAction<TFn extends ActionFn>(
  fn: TFn,
  initialData?: UnwrapPromise<ReturnType<TFn>>,
): ActionType<TFn> {
  const [state, setState] = useState<ActionState<ReturnType<TFn>>>({
    isLoading: false,
    error: undefined,
    data: initialData,
  });

  const act = useCallback(
    async (...args: Parameters<TFn>) => {
      setState({ isLoading: true, error: undefined, data: undefined });
      try {
        const data = (await fn(...args)) as ReturnType<TFn>;
        setState({ isLoading: false, error: undefined, data });
        return data;
      } catch (error) {
        setState({ isLoading: false, error: error as Error, data: undefined });
        throw error;
      }
    },
    [fn],
  );

  function setData(
    cb: (
      data?: UnwrapPromise<ReturnType<TFn>>,
    ) => UnwrapPromise<ReturnType<TFn>>,
  ) {
    setState((prevState) => ({ ...prevState, data: cb(prevState.data) }));
  }

  return { ...state, act, setData };
}
