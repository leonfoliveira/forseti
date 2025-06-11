import { useState } from "react";

export type LoadableState<TData> = {
  isLoading: boolean;
  data?: TData | undefined;
  error?: Error;
};

export function useLoadableState<TData>(
  initialState: Partial<LoadableState<TData>> = {},
) {
  const defaultState = {
    isLoading: false,
    data: undefined,
    error: undefined,
  };

  const [state, setState] = useState<LoadableState<TData>>({
    ...defaultState,
    ...initialState,
  });

  function start() {
    setState({ ...defaultState, ...initialState });
  }

  function finish(dataOrCallback?: TData | ((currentData: TData) => TData)) {
    if (typeof dataOrCallback === "function") {
      setState((currentState) => ({
        isLoading: false,
        data: (dataOrCallback as (currentData: TData) => TData)(
          currentState.data as TData,
        ),
        error: undefined,
      }));
    } else {
      setState({ isLoading: false, data: dataOrCallback, error: undefined });
    }
  }

  function fail(
    error: unknown,
    handlers: Record<string, (error: Error) => void> = {},
  ) {
    const _error = error instanceof Error ? error : new Error(String(error));
    setState({ isLoading: false, data: undefined, error: _error });
    const handler = handlers[_error.name] || handlers["default"];
    if (handler !== undefined) {
      return handler(_error);
    }
  }

  return {
    ...state,
    start,
    finish,
    fail,
  };
}
