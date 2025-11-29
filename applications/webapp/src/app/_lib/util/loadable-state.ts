import { useState } from "react";

import { useErrorHandler } from "@/app/_lib/util/error-handler-hook";

export type LoadableState<TData> = {
  isLoading: boolean;
  data?: TData | undefined;
  error?: Error;
};

export type UseLoadableStateReturnType<TData> = LoadableState<TData> & {
  start: () => void;
  finish: (dataOrCallback?: TData | ((currentData: TData) => TData)) => void;
  fail: (
    error: unknown,
    handlers?: Record<string, (error: Error) => void>,
  ) => void;
};

/**
 * Utility hook that wraps react useState with loading and error states.
 */
export function useLoadableState<TData>(
  initialState: Partial<LoadableState<TData>> = {},
): UseLoadableStateReturnType<TData> {
  const defaultState = {
    isLoading: false,
    data: undefined,
    error: undefined,
  };
  const errorHandler = useErrorHandler();

  const [state, setState] = useState<LoadableState<TData>>({
    ...defaultState,
    ...initialState,
  });

  function start() {
    setState({ ...defaultState, ...initialState, isLoading: true });
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
    customHandlers: Record<string, (error: Error) => void> = {},
  ) {
    const _error = error instanceof Error ? error : new Error(String(error));
    errorHandler.handle(_error, customHandlers);
    setState({ isLoading: false, data: undefined, error: _error });
  }

  return {
    ...state,
    start,
    finish,
    fail,
  };
}
