import { useState } from "react";

export type Fetcher<T> = {
  isLoading: boolean;
  hasError: boolean;
  data: T | undefined;
  fetch: (fn: () => Promise<T>) => Promise<T>;
};

export function useFetcher<T>(initialData?: T | undefined): Fetcher<T> {
  const [state, setState] = useState({
    isLoading: false,
    hasError: false,
    data: initialData,
  });

  async function fetch(fn: () => Promise<T>): Promise<T> {
    setState({ isLoading: true, hasError: false, data: undefined });
    try {
      const data = await fn();
      setState({ isLoading: false, hasError: false, data });
      return data;
    } catch (error) {
      setState({ isLoading: false, hasError: true, data: undefined });
      throw error;
    }
  }

  return { ...state, fetch };
}
